export type ProfileRole = 'client' | 'provider' | 'both' | 'admin'

export function roleBadgeStyles(role: ProfileRole): { background: string; color: string } {
  switch (role) {
    case 'client':
      return { background: '#f4f4f0', color: '#242423' }
    case 'provider':
      return { background: '#ffc900', color: '#000000' }
    case 'both':
      return { background: '#f1f333', color: '#000000' }
    case 'admin':
      return { background: '#000000', color: '#ffffff' }
    default:
      return { background: '#f4f4f0', color: '#242423' }
  }
}

export function getRoleLabel(role: ProfileRole): string {
  switch (role) {
    case 'client':
      return 'Client'
    case 'provider':
      return 'Provider'
    case 'both':
      return 'Both'
    case 'admin':
      return 'Admin'
    default:
      return role
  }
}

export function getDashboardPath(role: ProfileRole | string | undefined): string {
  if (role === 'admin') return '/dashboard/admin'
  if (role === 'provider') return '/dashboard/provider'
  return '/dashboard/client'
}
