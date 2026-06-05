-- Providers can read briefs they are assigned to
create policy "Providers can read assigned briefs"
on briefs for select using (
  exists (
    select 1 from assignments
    where assignments.brief_id = briefs.id
    and assignments.provider_id = auth.uid()
  )
);

-- Providers can update status on assigned briefs (e.g. mark as delivered)
create policy "Providers can update assigned briefs"
on briefs for update using (
  exists (
    select 1 from assignments
    where assignments.brief_id = briefs.id
    and assignments.provider_id = auth.uid()
  )
);

-- Providers can read client profiles for their assigned briefs
create policy "Providers can read assigned client profiles"
on profiles for select using (
  exists (
    select 1 from briefs
    join assignments on assignments.brief_id = briefs.id
    where briefs.client_id = profiles.id
    and assignments.provider_id = auth.uid()
  )
);

-- Providers can read admin profiles (for deliverable upload notifications)
create policy "Providers can read admin profiles"
on profiles for select using (role = 'admin');

-- Providers can notify client and admin when uploading deliverables
create policy "Providers can insert deliverable notifications"
on notifications for insert
with check (
  exists (
    select 1 from assignments a
    join briefs b on b.id = a.brief_id
    where a.provider_id = auth.uid()
    and (
      b.client_id = user_id
      or exists (select 1 from profiles where id = user_id and role = 'admin')
    )
  )
);
