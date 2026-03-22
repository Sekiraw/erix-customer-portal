'use client'

export default function DateCell({ cellData }: { cellData?: string | null }) {
  if (!cellData) return null

  const date = new Date(cellData)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return <span>{`${day}/${month}/${year} ${hours}:${minutes}`}</span>
}
