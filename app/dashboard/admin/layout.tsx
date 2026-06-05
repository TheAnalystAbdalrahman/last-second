import DashboardNav from '@/components/DashboardNav'

const navItems = [
  { label: 'Overview', href: '/dashboard/admin', exact: true },
  { label: 'Briefs', href: '/dashboard/admin/briefs' },
  { label: 'Users', href: '/dashboard/admin/users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f0' }}>
      <DashboardNav items={navItems} />
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  )
}
