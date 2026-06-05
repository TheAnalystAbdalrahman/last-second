'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getNotificationHref, type Notification } from '@/lib/notifications'
import NotificationRow from '@/components/NotificationRow'
import { cardStyle, primaryButtonStyle } from '@/lib/styles'

const PAGE_SIZE = 20

interface ClientNotificationsListProps {
  userId: string
}

export default function ClientNotificationsList({ userId }: ClientNotificationsListProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    async function fetchInitial() {
      const supabase = createClient()
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1)

      if (data) {
        setNotifications(data as Notification[])
        setHasMore(data.length === PAGE_SIZE)
      }
      setLoading(false)
    }

    fetchInitial()
  }, [userId])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const supabase = createClient()
    const offset = notifications.length

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (data) {
      setNotifications((prev) => [...prev, ...(data as Notification[])])
      setHasMore(data.length === PAGE_SIZE)
    } else {
      setHasMore(false)
    }
    setLoadingMore(false)
  }

  const handleNotificationClick = async (notification: Notification) => {
    const briefId = notification.payload?.brief_id
    const href = getNotificationHref(notification.type, 'client', briefId)
    if (!href) return

    if (!notification.read) {
      const supabase = createClient()
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id)

      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      )
    }

    router.push(href)
  }

  if (loading) {
    return (
      <div style={{ fontSize: 14, color: '#242423' }}>Loading notifications…</div>
    )
  }

  return (
    <div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          marginBottom: 24,
          color: '#000',
        }}
      >
        Notifications
      </h1>

      {notifications.length === 0 ? (
        <div style={{ ...cardStyle, fontSize: 14, color: '#242423' }}>
          No notifications yet
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              style={{
                borderBottom:
                  index < notifications.length - 1 ? '1px solid #d1d5dc' : 'none',
                background: notification.read ? '#ffffff' : '#f4f4f0',
              }}
            >
              <NotificationRow
                notification={notification}
                role="client"
                onClick={() => handleNotificationClick(notification)}
              />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{
              ...primaryButtonStyle,
              opacity: loadingMore ? 0.6 : 1,
            }}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
