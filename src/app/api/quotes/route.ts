import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getClientIp, isRateLimited, quoteSchema } from '@/lib/forms/security';
import { sendAdminAlert } from '@/lib/forms/notify';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`quote:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many quote requests. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid form details.' },
      { status: 400 }
    );
  }

  // Silent honeypot drop for spam bots
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { website, ...lead } = parsed.data;
  void website;
  const supabase = await createClient();

  const { error } = await supabase.from('quote_requests').insert({
    full_name: lead.full_name,
    phone: lead.phone,
    email: lead.email || null,
    move_type: lead.move_type,
    service_category: lead.service_category || null,
    sub_services: lead.sub_services ?? [],
    source: lead.source ?? 'website',
    pickup_location: lead.pickup_location,
    dropoff_location: lead.dropoff_location,
    preferred_date: lead.preferred_date || null,
    home_size: lead.home_size || null,
    notes: lead.notes || null,
  });

  if (error) {
    return NextResponse.json(
      { error: 'Could not submit quote right now. Please try again.' },
      { status: 500 }
    );
  }

  await sendAdminAlert(`New Moving Quote: ${lead.full_name} (${lead.move_type})`, [
    ['Name', lead.full_name],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Service', lead.move_type],
    ['Pickup', lead.pickup_location],
    ['Drop-off', lead.dropoff_location],
    ['Move Date', lead.preferred_date],
    ['Property Size', lead.home_size],
    ['Notes', lead.notes],
  ]);

  return NextResponse.json({ ok: true });
}
