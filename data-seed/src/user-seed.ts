import { getPayload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import config from '../../src/payload.config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type SeedUser = {
  email: string
  password: string
  firstName: string
  lastName: string
}

async function seedUsers(): Promise<void> {
  const usersPath = path.join(__dirname, '..', 'data', 'users.json')
  const raw = readFileSync(usersPath, 'utf-8')
  const users: SeedUser[] = JSON.parse(raw)

  if (!Array.isArray(users) || users.length === 0) {
    console.log('No users to seed in data-seed/data/users.json')
    return
  }

  const payload = await getPayload({ config })

  for (const user of users) {
    const { email, password, firstName, lastName } = user
    if (!email || !password || !firstName || !lastName) {
      console.warn(
        'Skipping invalid user entry (missing email, password, firstName or lastName):',
        user,
      )
      continue
    }

    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email.toLowerCase() } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`User already exists: ${email}`)
      continue
    }

    await payload.create({
      collection: 'users',
      data: {
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      overrideAccess: true,
    })
    console.log(`Created user: ${email}`)
  }
}

seedUsers()
  .then(() => {
    console.log('User seed finished.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('User seed failed:', err)
    process.exit(1)
  })
