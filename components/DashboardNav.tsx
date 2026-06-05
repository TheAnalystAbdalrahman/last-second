'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NotificationsBell from '@/components/NotificationsBell'
import type { DashboardRole } from '@/lib/notifications'

interface NavItem {
  label: string
  href: string
  exact?: boolean
}

interface DashboardNavProps {
  items: NavItem[]
  userId: string
  role: DashboardRole
}

export default function DashboardNav({ items, userId, role }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <nav
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #d1d5dc',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        paddingInline: 24,
        gap: 8,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Wordmark */}
      <Link
        href="/"
        style={{
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '-0.03em',
          color: '#000',
          textDecoration: 'none',
          marginRight: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#ff90e8',
            border: '1px solid #000',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            transform: 'rotate(-6deg)',
          }}
        >
          G
        </span>
        Last Second
      </Link>

      {/* Nav items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: active ? '5px 14px' : '5px 12px',
                borderRadius: 9999,
                background: active ? '#000' : 'transparent',
                color: active ? '#fff' : '#000',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
                transition: 'all 0.1s',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <NotificationsBell userId={userId} role={role} />

        {/* Profile menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            style={{
              height: 36,
              padding: '0 12px',
              borderRadius: 9999,
              background: 'transparent',
              border: '1px solid #d1d5dc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#000',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#f4f4f0',
                border: '1px solid #d1d5dc',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
              }}
            >
              U
            </span>
            <ChevronDown size={13} />
          </button>

          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: '#fff',
                border: '1px solid #d1d5dc',
                borderRadius: 8,
                minWidth: 160,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#000',
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
