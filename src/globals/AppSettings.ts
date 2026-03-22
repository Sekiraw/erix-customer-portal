import type { FieldAccess, GlobalConfig } from 'payload'
import type { User } from '../payload-types'
import { isLoggedIn } from '@/access/isLoggedIn'

const isAuthenticatedField: FieldAccess<any, User> = ({ req: { user } }) => Boolean(user)

export const AppSettings: GlobalConfig = {
  slug: 'app-settings',
  //   access: {
  //     // Allow reads for authenticated users so icon/title can be shown, but non-admins
  //     // will only see fields they have field-level read access to.
  //     read: isLoggedIn,
  //   },
  admin: {
    group: 'Settings',
  },
  label: {
    hu: 'Beállítások',
    en: 'Settings',
  },
  fields: [
    {
      name: 'branding',
      type: 'group',
      label: false,
      access: {
        read: isAuthenticatedField,
      },
      fields: [
        {
          name: 'appIcon',
          type: 'upload',
          relationTo: 'media',
          label: {
            hu: 'Logó',
            en: 'Logo',
          },
          admin: {
            components: {
              Field: {
                path: 'src/app/components/Settings/AppIconField.tsx',
              },
            },
            // description: {
            //   hu: 'Tölts fel egy PNG vagy SVG ikont, amely a felületen és böngészőben jelenik meg.',
            //   en: 'Upload the PNG or SVG icon that should appear across the app and browser tabs.',
            // },
          },
        },
        {
          name: 'appTitle',
          type: 'text',
          required: true,
          defaultValue: 'CRM Portál',
          label: {
            hu: 'Cím',
            en: 'Title',
          },
          admin: {
            components: {
              Field: {
                path: 'src/app/components/Settings/AppTitleField.tsx',
              },
            },
          },
          access: {
            read: isAuthenticatedField,
          },
        },
      ],
    },
  ],
}
