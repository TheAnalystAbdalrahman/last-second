export type ProfileRole = 'client' | 'provider' | 'both' | 'admin'

export function getDashboardPath(role: ProfileRole | string | undefined): string {
  if (role === 'admin') return '/dashboard/admin'
  if (role === 'provider') return '/dashboard/provider'
  return '/dashboard/client'
}
