import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getClientIp, isRateLimited, subscribeSchema } from '@/lib/forms/security';
import { sendAdminAlert, sendSubscriberWelcome } from '@/lib/forms/notify';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`subscribe:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please enter a valid email.' },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('subscribers')
    .insert({ email: parsed.data.email });

  // Postgres 23505 = unique_violation (already subscribed) -> return friendly success
  if (error && error.code !== '23505') {
    console.error('Supabase subscribe error:', error);
    return NextResponse.json(
      { error: 'Could not subscribe right now. Please try again.' },
      { status: 500 }
    );
  }

  if (!error) {
    await Promise.all([
      sendSubscriberWelcome(parsed.data.email),
      sendAdminAlert(`New Newsletter Subscriber: ${parsed.data.email}`, [
        ['Subscriber Email', parsed.data.email],
      ]),
    ]);
  }

  return NextResponse.json({ ok: true });
}
