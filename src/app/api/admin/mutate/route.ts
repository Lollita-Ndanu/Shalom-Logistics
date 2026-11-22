import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getOwnerUser } from '@/lib/auth/require-owner';
import { createClient } from '@/lib/supabase/server';

const TABLES = new Set(['quote_requests', 'contact_messages', 'subscribers']);

export async function POST(request: Request) {
  if (!await getOwnerUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload || typeof payload.action !== 'string') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const supabase = await createClient();

  if (payload.action === 'save-section') {
    if (
      typeof payload.sectionKey !== 'string' ||
      typeof payload.label !== 'string' ||
      typeof payload.isVisible !== 'boolean' ||
      !payload.content ||
      typeof payload.content !== 'object' ||
      Array.isArray(payload.content)
    ) {
      return NextResponse.json({ error: 'Invalid section content.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('site_sections')
      .update({
        label: payload.label,
        is_visible: payload.isVisible,
        content: payload.content,
        updated_at: new Date().toISOString(),
      })
      .eq('section_key', payload.sectionKey)
      .select('section_key')
      .single();

    if (error || !data) {
      console.error('Admin section save failed:', error);
      return NextResponse.json(
        { error: 'Could not save section. Verify owner permissions.' },
        { status: 500 }
      );
    }

    revalidateTag('site-sections', { expire: 0 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });

  }

  if (!TABLES.has(String(payload.table)) || typeof payload.id !== 'string') return NextResponse.json({ error: 'Invalid record.' }, { status: 400 });
  const table = payload.table as 'quote_requests' | 'contact_messages' | 'subscribers';

  if (payload.action === 'delete') {
    const { error } = await supabase.from(table).delete().eq('id', payload.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (payload.action === 'update' && payload.table === 'quote_requests' && typeof payload.status === 'string' && ['new', 'contacted', 'quoted', 'completed', 'archived'].includes(payload.status)) {
    const { error } = await supabase.from('quote_requests').update({ status: payload.status }).eq('id', payload.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (payload.action === 'update' && payload.table === 'contact_messages' && typeof payload.status === 'string' && ['unread', 'read', 'replied'].includes(payload.status)) {
    const { error } = await supabase.from('contact_messages').update({ status: payload.status, is_read: payload.status !== 'unread' }).eq('id', payload.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (payload.action === 'update' && payload.table === 'subscribers' && typeof payload.status === 'string') {
    const { error } = await supabase.from('subscribers').update({ status: payload.status }).eq('id', payload.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
