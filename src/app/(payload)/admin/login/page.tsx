import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import loginBackground from '@/assets/login-bg.webp'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const payload = await getPayload({ config })
  const { totalDocs } = await payload.count({ collection: 'users' })

  if (totalDocs === 0) {
    redirect('/admin/create-first-user')
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Image
        src={loginBackground}
        alt=""
        fill
        priority
        placeholder="blur"
        quality={80}
        sizes="100vw"
        className="object-cover object-center scale-120"
      />
      <LoginForm />
    </div>
  )
}
