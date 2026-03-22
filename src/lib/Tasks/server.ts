'use server'

import { Task, User } from '@/payload-types'
import { getUser } from '../auth/user'

export async function getTasks(): Promise<Task[] | null> {
  const { user, payload } = await getUser()

  if (!user) {
    payload.logger.error('No user found')
    return null
  }

  try {
    const tasks = await payload.find({
      collection: 'tasks',
      depth: 2,
      pagination: false,
      showHiddenFields: true,
    })
    //   .docs.filter((task: Task) => task.deadline != null)

    return tasks.docs as Task[]
  } catch (err) {
    payload.logger.error('Error fetching tasks:')
    payload.logger.error(err)
    return null
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: 'done' | 'new' | 'inprogress' | 'delayed' | 'closed' | undefined,
) {
  const { user, payload } = await getUser()

  if (!user) {
    payload.logger.error('No user found')
    return null
  }

  try {
    await payload.update({
      collection: 'tasks',
      id: Number(taskId),
      data: {
        status: status,
      },
    })

    return true
  } catch (err) {
    payload.logger.error('Failed to update task status')
    payload.logger.error(err)
    return null
  }
}

export async function updateTaskDisplayOrder(updates: Array<{ id: string; displayOrder: number }>) {
  const { user, payload } = await getUser()

  if (!user) {
    payload.logger.error('No user found')
    return null
  }

  try {
    await Promise.all(
      updates.map((update) =>
        payload.update({
          collection: 'tasks',
          id: Number(update.id),
          data: {
            displayOrder: update.displayOrder,
          },
        }),
      ),
    )

    return true
  } catch (err) {
    payload.logger.error('Failed to update task display order')
    payload.logger.error(err)
    return null
  }
}

// export async function moveTask(event: Task): Promise<Task[] | null> {
//   const { user, payload } = await getUser();

//   if (!user) {
//     payload.logger.error("No user found");
//     return null;
//   }

//   const taskId = Number(event.id);

//   try {
//     // Fetch the task
//     const task = await payload.findByID({
//       collection: "tasks",
//       id: taskId,
//       depth: 1,
//     });

//     // Update the dueDate
//     await payload.update({
//       collection: "tasks",
//       id: taskId,
//       data: {
//         status: event.status,
//       },
//     });

//     return await getTasks();
//   } catch (err) {
//     payload.logger.error(`Failed to move task ${taskId}:`, err);
//     return null;
//   }
// }

// export async function deleteTask(taskId: string): Promise<CalendarEvent[] | null> {
//   const { user, payload } = await getUser()

//   if (!user) {
//     payload.logger.error('No user found')
//     return null
//   }

//   const numericTaskId = Number(taskId)

//   try {
//     // Fetch the task
//     const task = await payload.findByID({
//       collection: 'tasks',
//       id: numericTaskId,
//       depth: 1,
//     })

//     // Check permission
//     const isAdmin = user.roles?.includes('admin')
//     const isAssignedTechnician =
//       user.roles?.includes('tech') &&
//       task.technician &&
//       typeof task.technician === 'object' &&
//       task.technician.id === user.id

//     if (!isAdmin && !isAssignedTechnician) {
//       payload.logger.error('User is not authorized to delete this task')
//       return null
//     }

//     // Delete the task
//     await payload.delete({
//       collection: 'tasks',
//       id: numericTaskId,
//     })

//     return await getTasks()
//   } catch (err) {
//     payload.logger.error(`Failed to delete task ${taskId}:`, err)
//     return null
//   }
// }

// export async function updateTaskStatus(taskId: string, status: Task['taskStatus']) {
//   const { user, payload } = await getUser()

//   if (!user) {
//     payload.logger.error('No user found')
//     return null
//   }

//   const numericTaskId = Number(taskId)

//   try {
//     const task = await payload.findByID({
//       collection: 'tasks',
//       id: numericTaskId,
//       depth: 1,
//     })

//     const isAdmin = user.roles?.includes('admin')
//     const isVendor = user.roles?.includes('vendor')
//     const isAssignedTech =
//       user.roles?.includes('tech') &&
//       task.technician &&
//       typeof task.technician === 'object' &&
//       task.technician.id === user.id

//     if (!isAdmin && !isVendor && !isAssignedTech) {
//       payload.logger.error('Not authorized to update task status')
//       return null
//     }

//     await payload.update({
//       collection: 'tasks',
//       id: numericTaskId,
//       data: {
//         taskStatus: status,
//       },
//     })

//     return true
//   } catch (err) {
//     payload.logger.error('Failed to update task status', err)
//     return null
//   }
