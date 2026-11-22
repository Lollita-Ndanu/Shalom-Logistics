-- Owner-only management access for admin lead and subscriber records.
-- Public submission policies/grants are retained from the initial migration.

grant select, update, delete on table public.quote_requests to authenticated;
grant select, update, delete on table public.contact_messages to authenticated;

alter table public.quote_requests drop constraint if exists quote_requests_status_check;
alter table public.quote_requests add constraint quote_requests_status_check
  check (status in ('new', 'contacted', 'quoted', 'completed', 'archived'));
alter table public.contact_messages add column if not exists status text default 'unread' not null;
update public.contact_messages set status = case when is_read then 'read' else 'unread' end where status is null or status = '';
alter table public.contact_messages drop constraint if exists contact_messages_status_check;
alter table public.contact_messages add constraint contact_messages_status_check
  check (status in ('unread', 'read', 'replied'));

drop policy if exists "Owner can select quote requests" on public.quote_requests;
create policy "Owner can select quote requests"
  on public.quote_requests for select to authenticated
  using ((select private.is_owner()));

drop policy if exists "Owner can update quote requests" on public.quote_requests;
create policy "Owner can update quote requests"
  on public.quote_requests for update to authenticated
  using ((select private.is_owner()))
  with check ((select private.is_owner()));

drop policy if exists "Owner can delete quote requests" on public.quote_requests;
create policy "Owner can delete quote requests"
  on public.quote_requests for delete to authenticated
  using ((select private.is_owner()));

drop policy if exists "Owner can select contact messages" on public.contact_messages;
create policy "Owner can select contact messages"
  on public.contact_messages for select to authenticated
  using ((select private.is_owner()));

drop policy if exists "Owner can update contact messages" on public.contact_messages;
create policy "Owner can update contact messages"
  on public.contact_messages for update to authenticated
  using ((select private.is_owner()))
  with check ((select private.is_owner()));

drop policy if exists "Owner can delete contact messages" on public.contact_messages;
create policy "Owner can delete contact messages"
  on public.contact_messages for delete to authenticated
  using ((select private.is_owner()));

-- Create the subscriber list required by the public subscribe endpoint when absent.
create table if not exists public.subscribers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null unique,
  status text default 'active' not null
);
revoke all on table public.subscribers from anon, authenticated;
grant insert on table public.subscribers to anon, authenticated;
grant select, update, delete on table public.subscribers to authenticated;
alter table public.subscribers enable row level security;

drop policy if exists "Public can subscribe" on public.subscribers;
create policy "Public can subscribe" on public.subscribers for insert to anon, authenticated with check (true);

drop policy if exists "Owner can select subscribers" on public.subscribers;
create policy "Owner can select subscribers" on public.subscribers for select to authenticated using ((select private.is_owner()));
drop policy if exists "Owner can update subscribers" on public.subscribers;
create policy "Owner can update subscribers" on public.subscribers for update to authenticated using ((select private.is_owner())) with check ((select private.is_owner()));
drop policy if exists "Owner can delete subscribers" on public.subscribers;
create policy "Owner can delete subscribers" on public.subscribers for delete to authenticated using ((select private.is_owner()));
