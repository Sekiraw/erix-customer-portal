import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import CreateFirstUserForm from './CreateFirstUserForm'

const copy = {
  title: { en: 'Create first user', hu: 'Üdvözöljük!' },
  subtitle: {
    en: 'To get started, create the first user!',
    hu: 'Kezdésként hozza létre az első-felhasználót!',
  },
}

export default async function CreateFirstUserPage() {
  const payload = await getPayload({ config })
  const { totalDocs } = await payload.count({ collection: 'users' })

  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'

  if (totalDocs > 0) {
    redirect('/admin/login')
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-8">
      <div className="absolute inset-0" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[480px] items-center">
        <div className="w-full p-10 text-foreground">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="text-black">
              <h1 className="text-3xl font-bold mb-4">{copy.title[lang]}</h1>
              <p className="text-md mt-1">{copy.subtitle[lang]}</p>
            </div>
          </div>

          <CreateFirstUserForm />
        </div>
      </div>
    </main>
  )
}
