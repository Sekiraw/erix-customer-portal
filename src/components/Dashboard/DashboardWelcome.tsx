'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation, useAuth } from '@payloadcms/ui'
import { UserCog, Bell, ChevronRight } from 'lucide-react'
import { isStaffRole } from '@/lib/auth/roles'
import type { User } from '@/payload-types'

const ALL_MODULES = [
  {
    href: '/admin/collections/users',
    title: { hu: 'Felhasználók', en: 'Users' },
    desc: {
      hu: 'Rendszer felhasználók és jogosultságok kezelése',
      en: 'Manage system users and permissions',
    },
    Icon: UserCog,
    iconClass: 'icon-pink',
    staffOnly: false,
  },
  {
    href: '/admin/collections/notifications',
    title: { hu: 'Értesítések', en: 'Notifications' },
    desc: {
      hu: 'Portál értesítések és rendszerüzenetek',
      en: 'Portal notifications and system messages',
    },
    Icon: Bell,
    iconClass: 'icon-accent',
    staffOnly: true,
  },
]

export function DashboardWelcome({ userName }: { userName: string; userRole?: string }) {
  const { i18n } = useTranslation()
  const lang = (i18n?.language as 'hu' | 'en') || 'hu'
  const { user } = useAuth()
  const userRole = (user as User | null)?.role
  const modules = ALL_MODULES.filter((m) => !m.staffOnly || isStaffRole(userRole))

  return (
    <div className="crm-dashboard">
      <div className="crm-dashboard__content">
        <div className="crm-dashboard__header crm-dashboard__animate-in">
          <h1 className="crm-dashboard__title">{lang === 'hu' ? 'Irányítópult' : 'Dashboard'}</h1>
          <p className="crm-dashboard__subtitle">
            {lang === 'hu'
              ? `Üdvözöljük, ${userName}!`
              : `Welcome, ${userName}!`}
          </p>
        </div>

        <div className="crm-dashboard__modules-grid">
          {modules.map((module, i) => (
            <Link
              key={module.href}
              href={module.href}
              className={`crm-dashboard__module-card crm-dashboard__animate-in crm-dashboard__delay-${i + 1}`}
            >
              <div className="crm-dashboard__module-header">
                <div className={`crm-dashboard__module-icon ${module.iconClass}`}>
                  <module.Icon className="w-5.5 h-5.5" strokeWidth={1.8} />
                </div>
                <div className="crm-dashboard__module-chevron">
                  <ChevronRight className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="crm-dashboard__module-body">
                <div className="crm-dashboard__module-title">{module.title[lang]}</div>
                <div className="crm-dashboard__module-desc">{module.desc[lang]}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
