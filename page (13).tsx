-- =====================================================================
-- RLS POLICIES — Lady Fabrics
-- =====================================================================

-- helper
create or replace function public.is_staff() returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('superadmin','admin','editor')
  );
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('superadmin','admin')
  );
$$;

-- enable RLS
alter table public.profiles enable row level security;
alter table public.sample_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.dealer_requests enable row level security;
alter table public.favorites enable row level security;
alter table public.sample_book_jobs enable row level security;
alter table public.events enable row level security;

-- PROFILES: user sees own; admins see all
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update
  using (public.is_admin());

-- SAMPLE REQUESTS: anyone (anon) can insert; staff can read/update
drop policy if exists sr_anon_insert on public.sample_requests;
create policy sr_anon_insert on public.sample_requests for insert with check (true);

drop policy if exists sr_staff_all on public.sample_requests;
create policy sr_staff_all on public.sample_requests for all
  using (public.is_staff()) with check (public.is_staff());

-- CONTACT
drop policy if exists cm_anon_insert on public.contact_messages;
create policy cm_anon_insert on public.contact_messages for insert with check (true);
drop policy if exists cm_staff_all on public.contact_messages;
create policy cm_staff_all on public.contact_messages for all using (public.is_staff());

-- NEWSLETTER
drop policy if exists ns_anon_insert on public.newsletter_subscribers;
create policy ns_anon_insert on public.newsletter_subscribers for insert with check (true);
drop policy if exists ns_staff_read on public.newsletter_subscribers;
create policy ns_staff_read on public.newsletter_subscribers for select using (public.is_staff());

-- DEALERS
drop policy if exists dr_anon_insert on public.dealer_requests;
create policy dr_anon_insert on public.dealer_requests for insert with check (true);
drop policy if exists dr_staff_all on public.dealer_requests;
create policy dr_staff_all on public.dealer_requests for all using (public.is_staff());

-- FAVORITES: by session_id (anon) or user_id (auth)
drop policy if exists fav_session_all on public.favorites;
create policy fav_session_all on public.favorites for all
  using (true) with check (true);
-- (session_id check enforced server-side for anon; tighten if auth required)

-- SAMPLE BOOK JOBS: staff only
drop policy if exists sbj_staff_all on public.sample_book_jobs;
create policy sbj_staff_all on public.sample_book_jobs for all using (public.is_staff());

-- EVENTS: anon insert; staff read
drop policy if exists ev_anon_insert on public.events;
create policy ev_anon_insert on public.events for insert with check (true);
drop policy if exists ev_staff_read on public.events;
create policy ev_staff_read on public.events for select using (public.is_staff());
