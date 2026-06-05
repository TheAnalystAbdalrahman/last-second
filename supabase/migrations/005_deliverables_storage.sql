insert into storage.buckets (id, name, public)
values ('deliverables', 'deliverables', true);

create policy "Providers can upload deliverables"
on storage.objects for insert
with check (bucket_id = 'deliverables' and auth.role() = 'authenticated');

create policy "Authenticated users can view deliverables"
on storage.objects for select
using (bucket_id = 'deliverables' and auth.role() = 'authenticated');
