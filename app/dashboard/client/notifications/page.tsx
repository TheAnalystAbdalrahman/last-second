import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientNotificationsList from '@/components/ClientNotificationsList'

export default async function ClientNotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  return <ClientNotificationsList userId={user.id} />
}
