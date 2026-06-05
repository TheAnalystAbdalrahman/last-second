-- Storage bucket for brief reference files
insert into storage.buckets (id, name, public)
values ('brief-references', 'brief-references', true);

create policy "Authenticated users can upload brief references"
on storage.objects for insert
with check (bucket_id = 'brief-references' and auth.role() = 'authenticated');

create policy "Anyone can view brief references"
on storage.objects for select
using (bucket_id = 'brief-references');

-- Urgency column for briefs
alter table briefs
  add column urgency text not null default 'normal'
  check (urgency in ('urgent', 'normal'));

-- Allow users to create their own notifications (e.g. brief_submitted)
create policy "Users can insert own notifications"
on notifications for insert
with check (auth.uid() = user_id);
