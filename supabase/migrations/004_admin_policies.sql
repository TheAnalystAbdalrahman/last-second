-- Allow admins to insert notifications for any user (e.g. brief_assigned, brief_completed)
create policy "Admins can insert notifications"
on notifications for insert
with check (public.is_admin());

-- Allow admins to update deliverables (approve / reject)
create policy "Admins can update all deliverables"
on deliverables for update
using (public.is_admin());
