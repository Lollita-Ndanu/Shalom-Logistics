-- 0. Private schema for internal security helpers (not exposed via Data API)
create schema if not exists private;

-- 1. User Roles Table
create table if not exists public.user_roles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('owner')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Non-recursive SECURITY DEFINER helper in private schema
create or replace function private.is_owner()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

revoke all on function private.is_owner() from public;
grant execute on function private.is_owner() to authenticated;

-- 2. Site Sections Table (Agreed-upon editable content & visibility only)
create table if not exists public.site_sections (
  section_key text primary key,
  label text not null,
  is_visible boolean default true not null,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Quote Requests Table
create table if not exists public.quote_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text not null,
  phone text not null,
  move_type text not null,
  pickup_location text not null,
  dropoff_location text not null,
  preferred_date date not null,
  home_size text,
  notes text,
  status text default 'new' not null check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'cancelled'))
);

-- 4. Contact Messages Table
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean default false not null
);

-- Enable Row Level Security (RLS) on ALL tables
alter table public.user_roles enable row level security;
alter table public.site_sections enable row level security;
alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;

-- Lock down default table grants, then grant strictly required operations
revoke all on table public.user_roles from anon, authenticated;
revoke all on table public.site_sections from anon, authenticated;
revoke all on table public.quote_requests from anon, authenticated;
revoke all on table public.contact_messages from anon, authenticated;

grant select on table public.user_roles to authenticated;

grant select on table public.site_sections to anon, authenticated;
grant insert, update, delete on table public.site_sections to authenticated;

grant insert on table public.quote_requests to anon, authenticated;
grant select, update, delete on table public.quote_requests to authenticated;

grant insert on table public.contact_messages to anon, authenticated;
grant select, update, delete on table public.contact_messages to authenticated;

-- USER_ROLES POLICIES
create policy "Users can read own role"
  on public.user_roles for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- SITE_SECTIONS POLICIES
create policy "Public can read site sections"
  on public.site_sections for select
  to anon, authenticated
  using (true);

create policy "Owner can insert site sections"
  on public.site_sections for insert
  to authenticated
  with check ((select private.is_owner()));

create policy "Owner can update site sections"
  on public.site_sections for update
  to authenticated
  using ((select private.is_owner()))
  with check ((select private.is_owner()));

create policy "Owner can delete site sections"
  on public.site_sections for delete
  to authenticated
  using ((select private.is_owner()));

-- QUOTE_REQUESTS POLICIES
create policy "Public can submit quote requests"
  on public.quote_requests for insert
  to anon, authenticated
  with check (true);

create policy "Owner can select quote requests"
  on public.quote_requests for select
  to authenticated
  using ((select private.is_owner()));

create policy "Owner can update quote requests"
  on public.quote_requests for update
  to authenticated
  using ((select private.is_owner()))
  with check ((select private.is_owner()));

create policy "Owner can delete quote requests"
  on public.quote_requests for delete
  to authenticated
  using ((select private.is_owner()));

-- CONTACT_MESSAGES POLICIES
create policy "Public can submit contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "Owner can select contact messages"
  on public.contact_messages for select
  to authenticated
  using ((select private.is_owner()));

create policy "Owner can update contact messages"
  on public.contact_messages for update
  to authenticated
  using ((select private.is_owner()))
  with check ((select private.is_owner()));

create policy "Owner can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using ((select private.is_owner()));

-- Seed Editable Content Only
insert into public.site_sections (section_key, label, is_visible, content) values
('header', 'Header & Navigation', true, '{
  "logoUrl": "",
  "companyName": "Shalom Movers",
  "ctaLabel": "Get a Free Quote",
  "ctaHref": "#quote",
  "navLinks": [
    { "label": "Home", "href": "/" },
    { "label": "Services", "href": "/services" },
    { "label": "About", "href": "/about" },
    { "label": "Contact", "href": "/contact" }
  ]
}'::jsonb),
('hero', 'Home Hero Section', true, '{
  "badgeText": "Trusted Moving & Logistics in Kenya",
  "headline": "Seamless Relocations, Handled With Care.",
  "subheadline": "From residential apartments to full corporate offices, we pack, transport, and set up on schedule.",
  "primaryBtnLabel": "Get a Free Quote",
  "primaryBtnHref": "#quote",
  "secondaryBtnLabel": "Explore Services",
  "secondaryBtnHref": "/services",
  "backgroundVideoUrl": "",
  "posterImageUrl": ""
}'::jsonb),
('services', 'Services Section', true, '{
  "sectionTitle": "Our Moving & Logistics Services",
  "sectionSubtitle": "Tailored relocation packages across Nairobi and East Africa.",
  "items": [
    {
      "id": "residential",
      "title": "Residential Moving",
      "description": "Full-service home packing, careful loading, and safe unpacking.",
      "imageUrl": "",
      "isVisible": true
    },
    {
      "id": "commercial",
      "title": "Commercial & Office Relocation",
      "description": "Structured corporate moves designed to minimize business downtime.",
      "imageUrl": "",
      "isVisible": true
    },
    {
      "id": "intercounty",
      "title": "Inter-County Transit",
      "description": "Reliable long-distance cargo and household transport across Kenya.",
      "imageUrl": "",
      "isVisible": true
    },
    {
      "id": "cleaning",
      "title": "Post-Move Cleaning",
      "description": "Deep cleaning for your old or new residence before and after moving day.",
      "imageUrl": "",
      "isVisible": true
    }
  ]
}'::jsonb),
('footer', 'Footer & Contact Info', true, '{
  "tagline": "Reliable residential and commercial movers across Kenya & East Africa.",
  "phone": "+254 751 794 728",
  "whatsappNumber": "254751794728",
  "email": "info@shalommovers.co.ke",
  "address": "Nairobi, Kenya",
  "copyrightText": "© 2026 Shalom Movers. All rights reserved.",
  "socials": {
    "facebook": "",
    "instagram": "",
    "tiktok": ""
  }
}'::jsonb)
on conflict (section_key) do nothing;
