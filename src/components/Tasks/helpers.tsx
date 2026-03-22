import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCcw,
  Circle,
  CircleDashed,
  LoaderCircle,
  CircleX,
  CircleCheck,
  CircleSmall,
} from 'lucide-react'
import { Task } from '@/payload-types'
import { taskStatusOptions } from '@/lib/locale/select-translations'

export type Lead = {
  id: string
  company: string
  contact: string
  value: number
  daysInStage: number | null
  deadline: Date
  priority: string
  status: string
  labels: string[]
  notesCount: number
  displayOrder: number
  owner?: {
    firstName: string
    lastName: string
    email: string
  } | null
}

export type Stage = {
  id: string
  name: string
  color: string
  icon: React.ReactNode
  leads: Lead[]
}

function daysBetween(date: Date) {
  const now = new Date()
  const diff = Math.abs(now.getTime() - date.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getColorForStatus(status: string) {
  switch (status) {
    case 'new':
      return 'bg-new'
    case 'inprogress':
      return 'bg-in-progress'
    case 'delayed':
      return 'bg-delayed'
    case 'done':
      return 'bg-done'
    case 'closed':
      return 'bg-closed'
    default:
      return 'bg-new'
  }
}

function getIconForStatus(status: string) {
  switch (status) {
    case 'new':
      return <CircleDashed className="h-6 w-6" />
    case 'inprogress':
      return <LoaderCircle className="h-6 w-6" />
    case 'delayed':
      return <CircleX className="h-6 w-6" />
    case 'done':
      return <CircleCheck className="h-6 w-6" />
    case 'closed':
      return <CircleSmall className="h-6 w-6" />
    default:
      return <Circle className="h-6 w-6" />
  }
}

export function buildPipelineStages(tasks: Task[], locale: string): Stage[] {
  // Map each status to a stage object
  const stages: Stage[] = taskStatusOptions.map((status) => ({
    id: status.value,
    name: status.label[locale as keyof typeof status.label] ?? status.value,
    color: getColorForStatus(status.value),
    icon: getIconForStatus(status.value),
    leads: [],
  }))

  // Convert array to a lookup for easy pushing
  const stageMap = Object.fromEntries(stages.map((s) => [s.id, s]))

  // Map each task to a lead and assign to the correct stage
  for (const task of tasks) {
    const stageId = task.status ?? 'new'
    const daysInStage = daysBetween(new Date(task.deadline || Date.now()))

    stageMap[stageId]?.leads.push({
      id: task.id.toString(),
      company: task.title,
      status: stageId,
      // contact: task.customer?.name ?? '-',
      daysInStage,
      deadline: new Date(task.deadline || Date.now()),
      priority: task.priority ?? 'kozepes',
      contact:
        task.leadsEntry && typeof task.leadsEntry === 'object'
          ? (task.leadsEntry.title ?? '-')
          : '-',
      value:
        task.leadsEntry && typeof task.leadsEntry === 'object' && task.leadsEntry.quotes
          ? task.leadsEntry.quotes.at(-1)?.amount || 0
          : 0,
      labels: task.tag ? [task.tag] : [],
      notesCount: task.notes ? task.notes.length : 0,
      displayOrder: task.displayOrder ?? 1,
      owner:
        task.owner && typeof task.owner === 'object'
          ? {
              firstName: task.owner.firstName,
              lastName: task.owner.lastName,
              email: task.owner.email,
            }
          : null,
    })
  }

  // Sort leads within each stage by displayOrder, then by id for stability
  stages.forEach((stage) => {
    stage.leads.sort((a, b) => a.displayOrder - b.displayOrder || Number(a.id) - Number(b.id))
  })

  return stages
}
