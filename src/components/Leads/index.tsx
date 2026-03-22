'use server'

import { getUser } from '@/lib/auth/user'
import { getInteractionsByLeadId } from '@/lib/Leads/server'
import { LeadInteractionsClient } from './InteractionField'

export const LeadInteractions = async (props: any) => {
  const locale = props.i18n.language

  if (props.operation === 'create') {
    return <LeadInteractionsClient tasks={[]} events={[]} locale={locale} />
  }

  const { user } = await getUser()
  if (!user) {
    return <div>Log in to view this component</div>
  }

  const parentId = props.formState?.id || props.data?.id
  const interactions = await getInteractionsByLeadId(parentId)

  return (
    <LeadInteractionsClient
      tasks={interactions.tasks}
      events={interactions.events}
      locale={locale}
    />
  )
}
