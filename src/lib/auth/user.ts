import { cookies, headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { getPayload } from 'payload'

export const getUser = async () => {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return { user, payload }
}
