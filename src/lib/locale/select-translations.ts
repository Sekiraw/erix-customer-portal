export type Language = 'hu' | 'en'

export const taskStatusOptions = [
  { label: { hu: 'Új', en: 'New' }, value: 'new' },
  { label: { hu: 'Folyamatban', en: 'In Progress' }, value: 'inprogress' },
  { label: { hu: 'Elhalasztva', en: 'Delayed' }, value: 'delayed' },
  { label: { hu: 'Kész', en: 'Done' }, value: 'done' },
  { label: { hu: 'Lezárt', en: 'Closed' }, value: 'closed' },
]

export function getTaskStatusLabel(value: string, language: Language): string | undefined {
  const option = taskStatusOptions.find((opt) => opt.value === value)
  return option?.label[language]
}

export const taskPriorityOptions = [
  { label: { hu: 'Alacsony', en: 'Low' }, value: 'low' },
  { label: { hu: 'Közepes', en: 'Medium' }, value: 'medium' },
  { label: { hu: 'Magas', en: 'High' }, value: 'high' },
  { label: { hu: 'Kiemelt', en: 'Urgent' }, value: 'urgent' },
]

export const leadServiceAreaOptions = [
  { label: { hu: 'DevOps', en: 'DevOps' }, value: 'devops' },
  { label: { hu: 'Üzemeltetés', en: 'Operations' }, value: 'uzemeltetes' },
  { label: { hu: 'Fejlesztés', en: 'Development' }, value: 'fejlesztes' },
  { label: { hu: 'Egyéb', en: 'Other' }, value: 'other' },
]

export const leadStatusOptions = [
  { label: { hu: 'Új', en: 'New' }, value: 'uj' },
  {
    label: { hu: 'Kick-Off meeting', en: 'Kick-Off meeting' },
    value: 'kickoff_meeting',
  },
  {
    label: { hu: 'Helyszíni szemle', en: 'On-site Survey' },
    value: 'helyszini_szemle',
  },
  {
    label: { hu: 'Árajánlatra vár', en: 'Awaiting Quote' },
    value: 'arajanlatra_var',
  },
  {
    label: { hu: 'Árajánlat elküldve', en: 'Quote Sent' },
    value: 'arajanlat_elkuldve',
  },
  { label: { hu: 'Meeting', en: 'Meeting' }, value: 'meeting' },
  {
    label: { hu: 'Árajánlat elfogadva', en: 'Quote Accepted' },
    value: 'arajanlat_elfogadva',
  },
  {
    label: { hu: 'Árajánlat elutasítva', en: 'Quote Rejected' },
    value: 'arajanlat_elutasitva',
  },
  {
    label: { hu: 'ÜF visszautasítva', en: 'Rejected by Client' },
    value: 'ugyfel_visszautasitotta',
  },
  { label: { hu: 'Alvómód', en: 'Dormant' }, value: 'alvomod' },
]

export const leadPriorityOptions = [
  { label: { hu: 'Alacsony', en: 'Low' }, value: 'alacsony' },
  { label: { hu: 'Közepes', en: 'Medium' }, value: 'kozepes' },
  { label: { hu: 'Magas', en: 'High' }, value: 'magas' },
  { label: { hu: 'Kiemelt', en: 'Urgent' }, value: 'kiemelt' },
]

export const quoteTypeOptions = [
  { label: { hu: 'Fix díjas', en: 'Fixed Fee' }, value: 'fix' },
  { label: { hu: 'Óradíj alapú', en: 'Hourly' }, value: 'hourly' },
]

export const quoteStatusOptions = [
  { label: { hu: 'Nincs válasz', en: 'No Response' }, value: 'none' },
  { label: { hu: 'Elfogadva', en: 'Accepted' }, value: 'accepted' },
  { label: { hu: 'Elutasítva', en: 'Rejected' }, value: 'rejected' },
]

export const eventTypeOptions = [
  { label: { hu: 'Értesítés', en: 'Notification' }, value: 'notification' },
  { label: { hu: 'Meeting', en: 'Meeting' }, value: 'meeting' },
]

export const eventPlatformOptions = [
  { label: { hu: 'Zoom', en: 'Zoom' }, value: 'zoom' },
  { label: { hu: 'Google Meet', en: 'Google Meet' }, value: 'google_meet' },
  { label: { hu: 'Microsoft Teams', en: 'Microsoft Teams' }, value: 'teams' },
  { label: { hu: 'Egyéb', en: 'Other' }, value: 'other' },
]
