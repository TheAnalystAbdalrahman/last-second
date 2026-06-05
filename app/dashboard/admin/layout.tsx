import { redirect } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'
import { createClient } from '@/lib/supabase/server'

const navItems = [
  { label: 'Overview', href: '/dashboard/admin', exact: true },
  { label: 'Briefs', href: '/dashboard/admin/briefs' },
  { label: 'Users', href: '/dashboard/admin/users' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f0' }}>
      <DashboardNav items={navItems} userId={user.id} role="admin" />
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  )
}
