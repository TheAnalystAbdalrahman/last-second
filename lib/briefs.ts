export type DeliverableType =
  | '3d_model'
  | 'physical_model'
  | '3d_print'
  | 'diagrams'
  | 'full_project'

export type BriefStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export type BriefUrgency = 'urgent' | 'normal'

export interface DeliverableOption {
  value: DeliverableType
  label: string
  description: string
}

export const DELIVERABLE_OPTIONS: DeliverableOption[] = [
  {
    value: '3d_model',
    label: '3D Digital Model',
    description: 'Digital 3D model files for visualization or fabrication',
  },
  {
    value: 'physical_model',
    label: 'Physical Scale Model',
    description: 'Hand-crafted or assembled physical scale model',
  },
  {
    value: '3d_print',
    label: '3D Printed Model',
    description: '3D printed physical model from digital files',
  },
  {
    value: 'diagrams',
    label: 'Technical/Conceptual Diagrams',
    description: 'Drawings, diagrams, or conceptual visualizations',
  },
  {
    value: 'full_project',
    label: 'Full Project Execution',
    description: 'End-to-end project delivery across multiple deliverables',
  },
]

const DELIVERABLE_LABELS: Record<DeliverableType, string> = {
  '3d_model': '3D Digital Model',
  physical_model: 'Physical Scale Model',
  '3d_print': '3D Printed Model',
  diagrams: 'Technical/Conceptual Diagrams',
  full_project: 'Full Project Execution',
}

const STATUS_LABELS: Record<BriefStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function getDeliverableLabel(type: DeliverableType): string {
  return DELIVERABLE_LABELS[type] ?? type
}

export function getStatusLabel(status: BriefStatus): string {
  return STATUS_LABELS[status] ?? status
}

export function formatDeadline(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export function formatDateTime(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function statusBadgeStyles(status: BriefStatus): {
  background: string
  color: string
  strikethrough?: boolean
} {
  switch (status) {
    case 'open':
    case 'cancelled':
      return { background: '#f4f4f0', color: '#242423', strikethrough: status === 'cancelled' }
    case 'assigned':
    case 'in_progress':
      return { background: '#ffc900', color: '#000000' }
    case 'delivered':
      return { background: '#f1f333', color: '#000000' }
    case 'completed':
      return { background: '#000000', color: '#ffffff' }
    default:
      return { background: '#f4f4f0', color: '#242423' }
  }
}

export function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const segments = pathname.split('/')
    const raw = segments[segments.length - 1] ?? 'file'
    const parts = raw.split('-')
    if (parts.length > 1) {
      return decodeURIComponent(parts.slice(1).join('-'))
    }
    return decodeURIComponent(raw)
  } catch {
    return url.split('/').pop() ?? 'file'
  }
}

export function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
}
