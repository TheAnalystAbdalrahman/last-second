import { redirect } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'
import { createClient } from '@/lib/supabase/server'

const navItems = [
  { label: 'My Projects', href: '/dashboard/client' },
  { label: 'New Brief', href: '/dashboard/client/new-brief' },
]

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f0' }}>
      <DashboardNav items={navItems} userId={user.id} role="client" />
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  )
}
