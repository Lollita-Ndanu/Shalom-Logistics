import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { contactSchema, getClientIp, isRateLimited } from '@/lib/forms/security';
import { sendAdminAlert } from '@/lib/forms/notify';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`contact:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many messages sent. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid message details.' },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { website, ...msg } = parsed.data;
  void website;
  const supabase = await createClient();

  const { error } = await supabase.from('contact_messages').insert({
    name: msg.full_name,
    email: msg.email,
    phone: msg.phone || null,
    subject: msg.subject || null,
    message: msg.message,
  });

  if (error) {
    return NextResponse.json(
      { error: 'Could not send message right now. Please try again.' },
      { status: 500 }
    );
  }

  await sendAdminAlert(`New Website Inquiry: ${msg.full_name}`, [
    ['Name', msg.full_name],
    ['Email', msg.email],
    ['Phone', msg.phone],
    ['Subject', msg.subject],
    ['Message', msg.message],
  ]);

  return NextResponse.json({ ok: true });
}
