'use server'

import { getUser } from '@/lib/auth/user'
import { DashboardWelcome } from './DashboardWelcome'

const translations = {
  en: {
    authRequired: 'You must be logged in to view this page.',
  },
  hu: {
    authRequired: 'A felület megtekintéséhez be kell jelentkezned.',
  },
}

// Defining the props as PageProps will cause a build error, so we use any here
export const Dashboard = async (props: any) => {
  const { user } = await getUser()
  const locale = props.i18n.language
  const t = translations[locale as keyof typeof translations] ?? translations.en

  if (!user) {
    return <div>{t.authRequired}</div>
  }

  const userObj = user as {
    firstName?: string
    lastName?: string
    email?: string
    roles?: string[]
  }
  const formattedUserName =
    userObj?.firstName && userObj?.lastName
      ? `${userObj.firstName} ${userObj.lastName}`
      : userObj?.firstName ||
        (typeof user === 'object'
          ? (user.email?.split('@')[0] || 'User').replace(/^./, (c: string) => c.toUpperCase())
          : 'User')
  const userRole = userObj?.roles?.includes('admin')
    ? locale === 'hu'
      ? 'Adminisztrátor'
      : 'Administrator'
    : userObj?.roles?.[0]
      ? locale === 'hu'
        ? 'Felhasználó'
        : 'User'
      : undefined

  return <DashboardWelcome userName={formattedUserName} userRole={userRole} />
}
