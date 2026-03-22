'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { updateTaskStatus, updateTaskDisplayOrder } from '@/lib/Tasks/server'
import { useStepNav } from '@payloadcms/ui'
import { translations } from './translations'
import { StageColumn } from './stage-column'
import { Lead, Stage } from '../helpers'

export function TasksKanban({
  locale,
  initialStages,
  stepNavLabel,
}: {
  locale: string
  initialStages: Stage[]
  stepNavLabel: string
}) {
  const t = translations[locale as keyof typeof translations] ?? translations.en

  const { setStepNav } = useStepNav()

  useEffect(() => {
    setStepNav([
      {
        label: stepNavLabel,
      },
    ])
  }, [setStepNav])

  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedFromStageId, setDraggedFromStageId] = useState<string | null>(null)

  const handleDragStart = (lead: Lead, stageId: string) => {
    setDraggedLead(lead)
    setDraggedFromStageId(stageId)
    setIsDragging(true)
  }

  const handleDelete = async (leadId: string) => {
    setStages((prevStages) =>
      prevStages.map((stage) => ({
        ...stage,
        leads: stage.leads.filter((lead) => lead.id !== leadId),
      })),
    )
    try {
      // const result = await deleteTask(leadId)
      // if (!result) {
      //   throw new Error('Failed to delete task on server')
      // }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMove = async (leadId: string, targetStageId: string) => {
    setStages((prevStages) => {
      let leadToMove: Lead | null = null

      // Find and remove the lead from its current stage
      const newStages = prevStages.map((stage) => {
        const leadIndex = stage.leads.findIndex((lead) => lead.id === leadId)
        if (leadIndex !== -1) {
          leadToMove = stage.leads[leadIndex]
          return {
            ...stage,
            leads: stage.leads.filter((lead) => lead.id !== leadId),
          }
        }
        return stage
      })

      // Add the lead to the target stage
      if (leadToMove) {
        const targetStageIndex = newStages.findIndex((stage) => stage.id === targetStageId)
        if (targetStageIndex !== -1) {
          const updatedLead: Lead = {
            //@ts-ignore
            ...leadToMove,
            status: targetStageId,
            daysInStage: 0,
          }
          newStages[targetStageIndex].leads.push(updatedLead)
        }
      }

      return newStages
    })
    await updateTaskStatus(
      leadId,
      targetStageId as 'new' | 'inprogress' | 'done' | 'delayed' | 'closed',
    )
  }

  const handleReorder = async (stageId: string, leadId: string, insertIndex: number) => {
    // First, calculate the updates based on current state
    const stage = stages.find((s) => s.id === stageId)
    if (!stage) return

    const currentLeads = [...stage.leads]
    const draggedIndex = currentLeads.findIndex((lead) => lead.id === leadId)
    if (draggedIndex === -1) return

    const [draggedLead] = currentLeads.splice(draggedIndex, 1)
    currentLeads.splice(insertIndex, 0, draggedLead)

    const updates = currentLeads.map((lead, index) => ({
      id: lead.id,
      displayOrder: index + 1,
    }))

    // Then update the UI state
    setStages((prevStages) => {
      const newStages = prevStages.map((stage) => {
        if (stage.id !== stageId) return stage

        const currentLeads = [...stage.leads]
        const draggedIndex = currentLeads.findIndex((lead) => lead.id === leadId)

        if (draggedIndex === -1) return stage

        // Remove the dragged lead
        const [draggedLead] = currentLeads.splice(draggedIndex, 1)

        // Insert at new position
        currentLeads.splice(insertIndex, 0, draggedLead)

        // Update displayOrder for all leads in this stage
        const updatedLeads = currentLeads.map((lead, index) => ({
          ...lead,
          displayOrder: index + 1,
        }))

        return {
          ...stage,
          leads: updatedLeads,
        }
      })

      return newStages
    })

    // Finally, update on server
    await updateTaskDisplayOrder(updates)
  }

  const handleDrop = async (targetStageId: string, insertIndex?: number) => {
    if (!draggedLead || !draggedFromStageId) return

    // Check if dropping within the same stage (reordering)
    if (draggedFromStageId === targetStageId && insertIndex !== undefined) {
      await handleReorder(targetStageId, draggedLead.id, insertIndex)
    } else {
      // Moving to a different stage - calculate updates before state change
      const targetStage = stages.find((s) => s.id === targetStageId)

      // Update UI state
      setStages((prevStages) => {
        const newStages = prevStages.map((stage) => ({
          ...stage,
          leads: stage.leads.filter((lead) => lead.id !== draggedLead.id),
        }))

        const targetStageIndex = newStages.findIndex((stage) => stage.id === targetStageId)

        if (targetStageIndex !== -1) {
          const insertPos =
            insertIndex !== undefined ? insertIndex : newStages[targetStageIndex].leads.length
          const updatedLead = {
            ...draggedLead,
            status: targetStageId,
            displayOrder: insertPos + 1,
          }

          newStages[targetStageIndex].leads.splice(insertPos, 0, updatedLead)

          // Update displayOrder for all leads in target stage
          newStages[targetStageIndex].leads = newStages[targetStageIndex].leads.map(
            (lead, index) => ({
              ...lead,
              displayOrder: index + 1,
            }),
          )
        }

        return newStages
      })

      // Update status on server
      await updateTaskStatus(
        draggedLead.id,
        targetStageId as 'new' | 'inprogress' | 'done' | 'delayed' | 'closed',
      )

      // Update displayOrder for all tasks in the target stage
      if (targetStage) {
        const targetLeads = targetStage.leads.filter((lead) => lead.id !== draggedLead.id)
        const insertPos = insertIndex !== undefined ? insertIndex : targetLeads.length

        // Insert the dragged lead at the correct position
        targetLeads.splice(insertPos, 0, draggedLead)

        // Create updates for all leads in target stage
        const updates = targetLeads.map((lead, index) => ({
          id: lead.id,
          displayOrder: index + 1,
        }))

        await updateTaskDisplayOrder(updates)
      }
    }

    setDraggedLead(null)
    setDraggedFromStageId(null)
    setIsDragging(false)
  }

  return (
    <div className="kanban">
      {stages.map((stage) => (
        <StageColumn
          key={stage.id}
          stage={stage}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDelete={handleDelete}
          onMove={handleMove}
          availableStages={stages}
          isDragOver={isDragging}
          locale={locale}
          draggedLead={draggedLead}
        />
      ))}
    </div>
  )
}
