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

    if (payload.sectionKey === 'global_media') {
      return NextResponse.json({ error: 'This section is not editable.' }, { status: 403 });
    }

    const safeContent = structuredClone(payload.content) as Record<string, unknown>;
    if (payload.sectionKey === 'about_story') {
      const { data: existing } = await supabase.from('site_sections').select('content').eq('section_key', 'about_story').maybeSingle();
      const existingContent = existing?.content as Record<string, unknown> | undefined;
      if (existingContent && 'mapLocations' in existingContent) safeContent.mapLocations = existingContent.mapLocations;
    }

    if (payload.sectionKey === 'gallery_content') {
      const categories = safeContent.categories;
      const items = safeContent.items;
      if (!Array.isArray(categories) || categories.length !== 5 || categories.some((category) => typeof category !== 'string' || !category.trim()) || new Set(categories).size !== 5) {
        return NextResponse.json({ error: 'Gallery must have five unique, non-empty categories.' }, { status: 400 });
      }
      if (!Array.isArray(items) || items.some((entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return true;
        const item = entry as Record<string, unknown>;
        const videoType = item.type === 'video' || (item.type == null && typeof item.src === 'string' && /\.(mp4|webm|mov)(?:$|\?)/i.test(item.src));
        const type = item.type ?? (videoType ? 'video' : 'image');
        return typeof item.src !== 'string' || !item.src.trim() || typeof item.alt !== 'string' || !item.alt.trim() || typeof item.category !== 'string' || !categories.includes(item.category) || !['image', 'video'].includes(String(type));
      })) {
        return NextResponse.json({ error: 'Every gallery item needs media, alt text, one valid category, and a valid media type.' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('site_sections')
      .update({
        label: payload.label,
        is_visible: payload.isVisible,
        content: safeContent,
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
