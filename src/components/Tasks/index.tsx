'use server'

import { getUser } from '@/lib/auth/user'
import { getTasks } from '@/lib/Tasks/server'
import { DefaultListView, Gutter } from '@payloadcms/ui'
import { buildPipelineStages } from './helpers'
import { TasksHeader } from './TasksHeader'
import { TasksKanban } from './components/tasks-dashboard'

const translations = {
  en: {
    authRequired: 'You must be logged in to view this page.',
    description: 'Track leads through different sales stages and identify bottlenecks',
    createLabel: 'Add',
  },
  hu: {
    authRequired: 'A felület megtekintéséhez be kell jelentkezned.',
    description:
      'Kövesd a leadeket az értékesítési szakaszokon keresztül és azonosítsd a szűk keresztmetszeteket',
    createLabel: 'Hozzáadás',
  },
}

// Defining the props as PageProps will cause a build error, so we use any here
export const Tasks = async (props: any) => {
  const { user } = await getUser()
  const locale = props.i18n.language
  const t = translations[locale as keyof typeof translations] ?? translations.en

  if (!user) {
    return <div>{t.authRequired}</div>
  }

  const params = await props.searchParams!
  const currentView = params?.view || 'list'

  const tasks = await getTasks()
  const stages = buildPipelineStages(tasks ?? [], locale)

  const title = props.collectionConfig.labels.plural[locale]

  return (
    <div className="tasks-view">
      <Gutter>
        <TasksHeader
          title={title}
          newDocumentURL={props.newDocumentURL}
          createLabel={t.createLabel}
          locale={locale}
          hasCreatePermission={props.hasCreatePermission}
        />
      </Gutter>

      {currentView === 'list' ? (
        <DefaultListView
          collectionSlug={props.collectionSlug}
          columnState={props.columnState}
          hasCreatePermission={props.hasCreatePermission}
          newDocumentURL={props.newDocumentURL}
          viewType={props.viewType}
          Table={props.Table}
        />
      ) : (
        <Gutter>
          <TasksKanban
            locale={locale}
            initialStages={stages}
            stepNavLabel={props.collectionConfig.labels.plural[locale]}
          />
        </Gutter>
      )}
    </div>
  )
}
