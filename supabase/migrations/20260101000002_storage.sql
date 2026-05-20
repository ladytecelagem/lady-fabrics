-- =====================================================================
-- STORAGE BUCKETS
-- =====================================================================
insert into storage.buckets (id, name, public)
values
  ('sample-books-source', 'sample-books-source', false),
  ('sample-books-pages', 'sample-books-pages', true),
  ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Public buckets read policy
create policy "public read pages" on storage.objects for select
  using (bucket_id in ('sample-books-pages','uploads'));

-- Staff write
create policy "staff write" on storage.objects for insert
  with check (public.is_staff());
create policy "staff update" on storage.objects for update
  using (public.is_staff());
create policy "staff delete" on storage.objects for delete
  using (public.is_staff());
