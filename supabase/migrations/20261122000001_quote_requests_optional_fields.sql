-- Keep quote fields optional as the public form specifies and retain
-- structured category/sub-service/source values independently of move_type.
alter table public.quote_requests
  alter column email drop not null,
  alter column preferred_date drop not null,
  alter column preferred_date type date using nullif(preferred_date::text, '')::date,
  alter column preferred_date drop default,
  add column if not exists service_category text,
  add column if not exists sub_services text[] not null default '{}',
  add column if not exists source text not null default 'website';

alter table public.quote_requests
  drop constraint if exists quote_requests_source_check;

alter table public.quote_requests
  add constraint quote_requests_source_check check (source in ('website', 'whatsapp'));

-- Public anonymous users retain insert-only access. Authenticated lead access
-- continues to be constrained by the existing owner-only RLS policies.
revoke select, update, delete on table public.quote_requests from anon;
grant insert on table public.quote_requests to anon;

drop policy if exists "Public can submit quote requests" on public.quote_requests;
create policy "Public can submit quote requests"
  on public.quote_requests for insert
  to anon, authenticated
  with check (true);

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
