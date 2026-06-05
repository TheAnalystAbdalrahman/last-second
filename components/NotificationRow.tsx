'use client'

import {
  getNotificationHref,
  getNotificationIcon,
  getNotificationTitle,
  timeAgo,
  type DashboardRole,
  type Notification,
} from '@/lib/notifications'

interface NotificationRowProps {
  notification: Notification
  role: DashboardRole
  onClick?: () => void
}

export default function NotificationRow({
  notification,
  role,
  onClick,
}: NotificationRowProps) {
  const Icon = getNotificationIcon(notification.type)
  const briefId = notification.payload?.brief_id
  const href = getNotificationHref(notification.type, role, briefId)
  const isClickable = Boolean(onClick && href)

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      style={{
        display: 'flex',
        gap: 12,
        width: '100%',
        padding: '12px 16px',
        background: 'transparent',
        border: 'none',
        borderLeft: notification.read ? '3px solid transparent' : '3px solid #000000',
        textAlign: 'left',
        cursor: isClickable ? 'pointer' : 'default',
        opacity: isClickable ? 1 : 0.85,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: notification.read ? '#ffffff' : '#f4f4f0',
          border: '1px solid #d1d5dc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#000',
        }}
      >
        <Icon size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: notification.read ? 400 : 500,
            color: '#000',
            marginBottom: 2,
          }}
        >
          {getNotificationTitle(notification.type)}
        </div>
        {notification.payload?.title && (
          <div
            style={{
              fontSize: 14,
              color: '#242423',
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {notification.payload.title}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#242423' }}>
          {timeAgo(notification.created_at)}
        </div>
      </div>
    </button>
  )
}
