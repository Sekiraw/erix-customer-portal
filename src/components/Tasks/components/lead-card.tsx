'use client'

import type React from 'react'
import { useState } from 'react'
import { MessageCircle, Calendar, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Lead, Stage } from '../helpers'
import { translations } from './translations'

export function LeadCard({
  lead,
  onDragStart,
  onDelete,
  onMove,
  availableStages,
  locale,
  isGhost = false,
}: {
  lead: Lead
  onDragStart: (lead: Lead) => void
  onDelete: (leadId: string) => void
  onMove: (leadId: string, targetStageId: string) => void
  availableStages: Stage[]
  locale: string
  isGhost?: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const t = translations[locale as keyof typeof translations] ?? translations.en

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return '#E24B4A'
      case 'high':
        return '#F59E0B'
      case 'medium':
        return '#10B981'
      case 'low':
        return '#2563EB'
      default:
        return '#2563EB'
    }
  }

  const getStatusLabel = (status: string): string =>
    t.status[status as keyof typeof t.status] ?? status

  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case 'inprogress':
        return { background: '#EEF2FF', color: '#4F46E5' }
      case 'delayed':
        return { background: '#FFF0ED', color: '#c2410c' }
      case 'done':
        return { background: '#EEFBF4', color: '#065f46' }
      case 'closed':
        return { background: '#F3F3F5', color: 'var(--text-secondary)' }
      default:
        return { background: 'var(--bg)', color: 'var(--text-secondary)' }
    }
  }

  const getStatusDotColor = (status: string): string => {
    switch (status) {
      case 'inprogress':
        return '#4F46E5'
      case 'delayed':
        return '#c2410c'
      case 'done':
        return '#065f46'
      default:
        return 'var(--text-tertiary)'
    }
  }

  const getPriorityLabel = (priority: string): string =>
    t.priorityLabel[priority as keyof typeof t.priorityLabel] ?? priority

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', lead.id)
    onDragStart(lead)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!isGhost && !isDragging) {
      setIsViewModalOpen(true)
    }
  }

  const initials = lead.contact
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <div
        className={`task-card ${`priority-${getPriorityLabel(lead.priority).toLowerCase()}`} ${
          isGhost ? 'ghost' : isDragging ? 'dragging' : ''
        }`}
        style={{
          borderLeftColor: getPriorityColor(lead.priority),
          cursor: isGhost ? 'default' : 'grab',
          opacity: isGhost ? 0.5 : isDragging ? 0.5 : 1,
        }}
        draggable={!isGhost}
        onDragStart={isGhost ? undefined : handleDragStart}
        onDragEnd={isGhost ? undefined : handleDragEnd}
        onClick={handleClick}
      >
        <div className="task-title">{lead.company}</div>
        <div className="task-meta">
          <div className={`task-meta-item${lead.deadline < new Date() ? ' overdue' : ''}`}>
            <Calendar size={13} strokeWidth={1.8} />
            {lead.deadline.toLocaleDateString(locale, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </div>
          <div className="task-meta-item">
            <MessageCircle size={13} strokeWidth={1.8} />
            {lead.notesCount}
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent
          className="task-dialog"
          showCloseButton={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div
            className={`task-dialog-accent priority-${getPriorityLabel(lead.priority).toLowerCase()}`}
            style={{
              background: getPriorityColor(lead.priority),
            }}
          />
          <div className="task-dialog-body">
            <div className="task-dialog-header">
              <div className="task-dialog-title">{lead.company}</div>
              <button className="task-dialog-close" onClick={() => setIsViewModalOpen(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="task-dialog-lead">
              <div className="task-dialog-lead-avatar">{initials}</div>
              <div className="task-dialog-lead-company">{lead.contact}</div>
            </div>

            <div className="task-dialog-fields">
              <div className="task-dialog-field">
                <div className="task-dialog-field-label">{t.dialogs.fieldStatus}</div>
                <div className="task-dialog-field-value">
                  <span
                    className="status-badge"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      ...getStatusStyle(lead.status),
                    }}
                  >
                    <span
                      className="status-dot"
                      style={{ background: getStatusDotColor(lead.status) }}
                    />
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
              </div>
              <div className="task-dialog-field">
                <div className="task-dialog-field-label">{t.dialogs.fieldPriority}</div>
                <div className="task-dialog-field-value">
                  <span
                    className="priority-badge"
                    style={{
                      background:
                        lead.priority === 'urgent'
                          ? '#FEF2F2'
                          : lead.priority === 'high'
                            ? '#FFFBEB'
                            : lead.priority === 'medium'
                              ? '#ECFDF5'
                              : '#EFF6FF',
                      color:
                        lead.priority === 'urgent'
                          ? '#791F1F'
                          : lead.priority === 'high'
                            ? '#854F0B'
                            : lead.priority === 'medium'
                              ? '#065F46'
                              : '#1E40AF',
                    }}
                  >
                    {getPriorityLabel(lead.priority)}
                  </span>
                </div>
              </div>
              <div className="task-dialog-field">
                <div className="task-dialog-field-label">{t.dialogs.fieldDeadline}</div>
                <div className="task-dialog-field-value">
                  <Calendar size={14} strokeWidth={1.8} />
                  <span>
                    {lead.deadline.toLocaleDateString(locale, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <div className="task-dialog-field">
                <div className="task-dialog-field-label">{t.dialogs.fieldOwner}</div>
                <div className="task-dialog-field-value">
                  {lead.owner ? (
                    <>
                      <div className="task-dialog-owner-avatar">
                        {(lead.owner.firstName?.[0] ?? '').toUpperCase()}
                        {(lead.owner.lastName?.[0] ?? '').toUpperCase()}
                      </div>
                      <span>{lead.owner.email}</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                  )}
                </div>
              </div>
            </div>

            <div className="task-dialog-footer">
              <div />
              <button
                className="btn-jump-task"
                onClick={() => {
                  if (window.top) {
                    window.top.location.href = `/admin/collections/tasks/${lead.id}`
                  }
                }}
              >
                {t.dialogs.jumpToTask}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
