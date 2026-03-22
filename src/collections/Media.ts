import path from 'path'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media file',
    plural: 'Media files',
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'filename',
    hidden: true,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*'],
  },
  fields: [
    // {
    //   name: 'alt',
    //   type: 'text',
    //   label: {
    //     hu: 'Alternatív szöveg',
    //     en: 'Alt text',
    //   },
    //   required: false,
    // },
  ],
}

export default Media
