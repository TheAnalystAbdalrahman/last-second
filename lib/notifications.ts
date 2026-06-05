import type { LucideIcon } from 'lucide-react'
import { CheckCircle, FileText, Upload, UserCheck } from 'lucide-react'

export type NotificationType =
  | 'brief_submitted'
  | 'brief_assigned'
  | 'deliverable_uploaded'
  | 'brief_completed'
  | 'revision_requested'

export type DashboardRole = 'client' | 'provider' | 'admin'

export interface Notification {
  id: string
  user_id: string
  type: string
  payload: { brief_id?: string; title?: string } | null
  read: boolean
  created_at: string
}

const NOTIFICATION_TITLES: Record<string, string> = {
  brief_submitted: 'Brief submitted successfully',
  brief_assigned: 'Your brief has been assigned',
  deliverable_uploaded: 'Deliverable ready for review',
  brief_completed: 'Project completed',
  revision_requested: 'Revision requested',
}

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  brief_submitted: FileText,
  brief_assigned: UserCheck,
  deliverable_uploaded: Upload,
  brief_completed: CheckCircle,
  revision_requested: FileText,
}

export function getNotificationTitle(type: string): string {
  return NOTIFICATION_TITLES[type] ?? 'Notification'
}

export function getNotificationIcon(type: string): LucideIcon {
  return NOTIFICATION_ICONS[type] ?? FileText
}

export function getNotificationHref(
  type: string,
  role: DashboardRole,
  briefId: string | undefined
): string | null {
  if (!briefId) return null

  switch (type) {
    case 'brief_submitted':
      if (role === 'client') return `/dashboard/client/briefs/${briefId}`
      break
    case 'brief_assigned':
      if (role === 'client') return `/dashboard/client/briefs/${briefId}`
      if (role === 'provider') return `/dashboard/provider/briefs/${briefId}`
      break
    case 'deliverable_uploaded':
      if (role === 'admin') return `/dashboard/admin/briefs/${briefId}`
      if (role === 'client') return `/dashboard/client/briefs/${briefId}`
      break
    case 'brief_completed':
      if (role === 'provider') return `/dashboard/provider/briefs/${briefId}`
      if (role === 'client') return `/dashboard/client/briefs/${briefId}`
      break
    case 'revision_requested':
      if (role === 'provider') return `/dashboard/provider/briefs/${briefId}`
      break
  }

  return null
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
