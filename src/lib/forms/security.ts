import { z } from 'zod';

// Simple in-memory sliding-window rate limiter per IP + route
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((ts) => ts > windowStart);

  if (recent.length >= maxRequests) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);
  return false;
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export const quoteSchema = z.object({
  full_name: z.string().trim().min(2, 'Please enter your name.').max(120),
  phone: z.string().trim().min(7, 'Please enter a valid phone number.').max(40),
  email: z.union([z.string().trim().email('Invalid email address.').max(160), z.literal('')]).optional(),
  service_category: z.string().trim().min(1).max(120).optional(),
  sub_services: z.array(z.string().trim().min(1).max(200)).max(30).optional(),
  source: z.enum(['website', 'whatsapp']).optional(),
  move_type: z.string().trim().min(2, 'Select a service type.').max(500),
  pickup_location: z.string().trim().min(2, 'Enter pickup location.').max(200),
  dropoff_location: z.string().trim().min(2, 'Enter destination location.').max(200),
  preferred_date: z.union([z.string().date(), z.literal('')]).optional(),
  home_size: z.string().trim().max(80).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  // Honeypot field — humans leave this blank; bots auto-fill it
  website: z.string().max(200).optional().or(z.literal('')),
});

export const contactSchema = z.object({
  full_name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(160),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  subject: z.string().trim().max(160).optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Please enter a message.').max(3000),
  website: z.string().max(200).optional().or(z.literal('')),
});

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(160),
  website: z.string().max(200).optional().or(z.literal('')),
});
