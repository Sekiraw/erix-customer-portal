import type { CollectionConfig } from 'payload'
import { isStaff } from '@/access/roles'
import { isStaffRole } from '@/lib/auth/roles'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'message',
    defaultColumns: ['type', 'message', 'read', 'relatedUser', 'createdAt'],
    hidden: ({ user }) => !isStaffRole((user as { role?: string } | null)?.role),
  },
  labels: {
    singular: { en: 'Notification', hu: 'Értesítés' },
    plural: { en: 'Notifications', hu: 'Értesítések' },
  },
  access: {
    // Only created programmatically via overrideAccess
    create: () => false,
    read: isStaff,
    update: isStaff,
    delete: () => false,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      label: { en: 'Type', hu: 'Típus' },
      options: [
        {
          label: { en: 'New Registration', hu: 'Új regisztráció' },
          value: 'new_registration',
        },
      ],
    },
    {
      name: 'message',
      type: 'text',
      required: true,
      label: { en: 'Message', hu: 'Üzenet' },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Read', hu: 'Olvasott' },
    },
    {
      name: 'relatedUser',
      type: 'relationship',
      relationTo: 'users',
      label: { en: 'Related User', hu: 'Kapcsolódó felhasználó' },
    },
  ],
}
