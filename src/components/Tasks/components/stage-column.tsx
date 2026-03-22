'use client'

import type React from 'react'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { translations } from './translations'
import { LeadCard } from './lead-card'
import { Lead, Stage } from '../helpers'

export function StageColumn({
  stage,
  onDragStart,
  onDrop,
  onDelete,
  onMove,
  availableStages,
  isDragOver,
  locale,
  draggedLead,
}: {
  stage: Stage
  onDragStart: (lead: Lead, stageId: string) => void
  onDrop: (stageId: string, insertIndex?: number) => void
  onDelete: (leadId: string) => void
  onMove: (leadId: string, targetStageId: string) => void
  availableStages: Stage[]
  isDragOver: boolean
  locale: string
  draggedLead: Lead | null
}) {
  const [isOver, setIsOver] = useState(false)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const t = translations[locale as keyof typeof translations] ?? translations.en

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false)
      setDropIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    onDrop(stage.id.toString(), dropIndex !== null ? dropIndex : undefined)
    setDropIndex(null)
  }

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedLead) return

    const rect = e.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    const mouseY = e.clientY

    const insertBelow = mouseY > midpoint
    const newDropIndex = insertBelow ? index + 1 : index

    setDropIndex(newDropIndex)
    setIsOver(true)
  }

  const getColumnClass = (): string => {
    switch (stage.id) {
      case 'new':
        return 'col-new'
      case 'inprogress':
        return 'col-progress'
      case 'delayed':
        return 'col-delayed'
      case 'done':
        return 'col-done'
      case 'closed':
        return 'col-closed'
      default:
        return 'col-new'
    }
  }

  return (
    <div
      className={`kanban-col ${getColumnClass()} ${isOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="kanban-col-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="kanban-col-title">{stage.name}</span>
          <span className="kanban-col-count">{stage.leads.length}</span>
        </div>
        <div className="kanban-col-icon">{stage.icon}</div>
      </div>

      <div className="kanban-col-body">
        {stage.leads.length === 0 && isOver && (
          <div
            style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '32px 16px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '12px',
            }}
          >
            {t.labels.dropHere}
          </div>
        )}
        {stage.leads.map((lead, index) => (
          <div key={lead.id}>
            {dropIndex === index && draggedLead && (
              <div onDragOver={(e) => handleCardDragOver(e, index)}>
                <LeadCard
                  lead={draggedLead}
                  onDragStart={() => {}}
                  onDelete={() => {}}
                  onMove={() => {}}
                  availableStages={availableStages}
                  locale={locale}
                  isGhost
                />
              </div>
            )}
            <div onDragOver={(e) => handleCardDragOver(e, index)}>
              <LeadCard
                lead={lead}
                onDragStart={(lead) => onDragStart(lead, stage.id.toString())}
                onDelete={onDelete}
                onMove={onMove}
                availableStages={availableStages}
                locale={locale}
              />
            </div>
          </div>
        ))}
        {dropIndex === stage.leads.length && draggedLead && stage.leads.length > 0 && (
          <div onDragOver={(e) => handleCardDragOver(e, stage.leads.length)}>
            <LeadCard
              lead={draggedLead}
              onDragStart={() => {}}
              onDelete={() => {}}
              onMove={() => {}}
              availableStages={availableStages}
              locale={locale}
              isGhost
            />
          </div>
        )}
        <button
          className="add-task-btn"
          onClick={() => {
            if (window.top) {
              window.top.location.href = `/admin/collections/tasks/create`
            }
          }}
        >
          <Plus size={14} strokeWidth={2} />
          {t.labels.addTask}
        </button>
      </div>
    </div>
  )
}
