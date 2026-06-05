'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  getNotificationHref,
  type DashboardRole,
  type Notification,
} from '@/lib/notifications'
import NotificationRow from '@/components/NotificationRow'

interface NotificationsBellProps {
  userId: string
  role: DashboardRole
}

export default function NotificationsBell({ userId, role }: NotificationsBellProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchNotifications() {
      const [listResult, countResult] = await Promise.all([
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false),
      ])

      if (listResult.data) {
        setNotifications(listResult.data as Notification[])
      }
      if (countResult.count !== null) {
        setUnreadCount(countResult.count)
      }
    }

    fetchNotifications()

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification
          setNotifications((prev) => [notification, ...prev].slice(0, 10))
          setUnreadCount((count) => count + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleMarkAllRead = async () => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = async (notification: Notification) => {
    const briefId = notification.payload?.brief_id
    const href = getNotificationHref(notification.type, role, briefId)
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
      setUnreadCount((count) => Math.max(0, count - 1))
    }

    setOpen(false)
    router.push(href)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'transparent',
          border: '1px solid #d1d5dc',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          position: 'relative',
        }}
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              minWidth: 16,
              height: 16,
              borderRadius: '50%',
              background: '#000000',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 320,
            background: '#ffffff',
            border: '1px solid #d1d5dc',
            borderRadius: 16,
            overflow: 'hidden',
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid #d1d5dc',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 500, color: '#000' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 14,
                  color: '#242423',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  fontSize: 14,
                  color: '#242423',
                  textAlign: 'center',
                }}
              >
                No notifications yet
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  style={{
                    borderBottom:
                      index < notifications.length - 1
                        ? '1px solid #d1d5dc'
                        : 'none',
                    background: notification.read ? '#ffffff' : '#f4f4f0',
                  }}
                >
                  <NotificationRow
                    notification={notification}
                    role={role}
                    onClick={() => handleNotificationClick(notification)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
