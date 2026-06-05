import DashboardNav from '@/components/DashboardNav'

const navItems = [
  { label: 'My Assignments', href: '/dashboard/provider' },
]

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f0' }}>
      <DashboardNav items={navItems} />
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  )
}
