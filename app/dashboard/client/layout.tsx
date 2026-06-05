import DashboardNav from '@/components/DashboardNav'

const navItems = [
  { label: 'My Projects', href: '/dashboard/client' },
  { label: 'New Brief', href: '/dashboard/client/new-brief' },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f0' }}>
      <DashboardNav items={navItems} />
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  )
}
