import { NextResponse } from 'next/server';
import { getOwnerUser } from '@/lib/auth/require-owner';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  if (!await getOwnerUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = await createClient();
  const [quotes, messages, subscribers, sections] = await Promise.all([
    supabase.from('quote_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    supabase.from('subscribers').select('*').order('created_at', { ascending: false }),
    supabase.from('site_sections').select('section_key,label,is_visible,content,updated_at').order('section_key'),
  ]);
  const error = quotes.error ?? messages.error ?? subscribers.error ?? sections.error;
  if (error) {
    console.error('Admin dashboard query failed:', error);
    return NextResponse.json({ error: 'Could not load admin data.' }, { status: 500 });
  }
  return NextResponse.json({ quotes: quotes.data ?? [], messages: messages.data ?? [], subscribers: subscribers.data ?? [], sections: sections.data ?? [] });
}
