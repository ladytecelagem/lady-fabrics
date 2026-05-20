-- =====================================================================
-- LADY FABRICS — Initial Schema
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- =====================================================================
-- PROFILES (admin/staff)
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'viewer' check (role in ('superadmin','admin','editor','viewer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- =====================================================================
-- SAMPLE REQUESTS
-- =====================================================================
create table if not exists public.sample_requests (
  id uuid primary key default gen_random_uuid(),
  status text default 'new' check (status in ('new','reviewing','approved','shipped','rejected','closed')),
  name text not null,
  email text not null,
  company text,
  role text,
  phone text,
  country text,
  market text check (market in ('workplace','hospitality','residential','acoustic','furniture','contract','converter','other')),
  project_name text,
  project_brief text,
  collection_slugs text[] default '{}',
  sample_book_slugs text[] default '{}',
  shipping_address jsonb,
  source text,
  notes text,
  locale text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists sample_requests_status_idx on public.sample_requests(status);
create index if not exists sample_requests_created_idx on public.sample_requests(created_at desc);

-- =====================================================================
-- CONTACT, NEWSLETTER, DEALER REQUESTS
-- =====================================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, company text, phone text,
  subject text, message text not null, locale text default 'en',
  handled boolean default false, created_at timestamptz default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null, name text, locale text default 'en',
  confirmed boolean default false, source text, created_at timestamptz default now()
);

create table if not exists public.dealer_requests (
  id uuid primary key default gen_random_uuid(),
  company text not null, contact_name text not null, email text not null, phone text,
  country text, market text, website text, message text,
  status text default 'new' check (status in ('new','reviewing','approved','rejected')),
  created_at timestamptz default now()
);

-- =====================================================================
-- FAVORITES / SAVED CARTELAS (visitor sessions)
-- =====================================================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references auth.users on delete cascade,
  kind text not null check (kind in ('collection','sample_book')),
  ref_slug text not null,
  meta jsonb,
  created_at timestamptz default now(),
  unique (session_id, kind, ref_slug)
);
create index if not exists favorites_session_idx on public.favorites(session_id);

-- =====================================================================
-- SAMPLE BOOK INGESTION (PDF parsing pipeline)
-- =====================================================================
create table if not exists public.sample_book_jobs (
  id uuid primary key default gen_random_uuid(),
  sanity_doc_id text,
  filename text not null,
  storage_path text not null,
  status text default 'queued' check (status in ('queued','processing','complete','failed')),
  page_count int,
  extracted jsonb,
  error text,
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================================
-- ANALYTICS (lightweight events)
-- =====================================================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  user_id uuid,
  name text not null,
  props jsonb,
  url text, referrer text, locale text,
  created_at timestamptz default now()
);
create index if not exists events_name_idx on public.events(name);
create index if not exists events_created_idx on public.events(created_at desc);

-- =====================================================================
-- updated_at trigger
-- =====================================================================
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$
declare t text;
begin
  for t in select unnest(array['profiles','sample_requests','sample_book_jobs']) loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end$$;
