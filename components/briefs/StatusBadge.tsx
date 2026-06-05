import { getStatusLabel, statusBadgeStyles, type BriefStatus } from '@/lib/briefs'

interface StatusBadgeProps {
  status: BriefStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = statusBadgeStyles(status)

  return (
    <span
      style={{
        display: 'inline-block',
        background: styles.background,
        color: styles.color,
        borderRadius: 4,
        padding: '4px 10px',
        fontSize: 13,
        fontWeight: 500,
        textDecoration: styles.strikethrough ? 'line-through' : 'none',
      }}
    >
      {getStatusLabel(status)}
    </span>
  )
}
