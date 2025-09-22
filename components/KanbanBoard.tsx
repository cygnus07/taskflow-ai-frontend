'use client'

import { useState } from 'react'
import { taskAPI } from '@/lib/api'
import { 
  Clock, 
  User, 
  Brain,
  GripVertical 
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Task } from '@/types/task'

// interface Task {
//   _id: string
//   title: string
//   description?: string
//   status: 'todo' | 'in-progress' | 'review' | 'done'
//   priority: 'low' | 'medium' | 'high' | 'urgent'
//   dueDate?: string
//   assignees?: Array<{
//     _id: string
//     name: string
//     email: string
//   }>
//   aiMetadata?: {
//     suggestedPriority?: string
//   }
// }

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskUpdated: () => void
}

const statusColumns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'review', title: 'Review', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' }
]

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
}

export default function KanbanBoard({ tasks, onTaskClick, onTaskUpdated }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const tasksByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id)
    return acc
  }, {} as Record<string, Task[]>)

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    
    // Add visual feedback
    const target = e.target as HTMLElement
    target.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.style.opacity = '1'
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only remove highlight if we're leaving the column entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (!draggedTask || draggedTask.status === newStatus) {
      return
    }

    try {
      await taskAPI.updateStatus(draggedTask._id, newStatus)
      onTaskUpdated()
      toast.success(`Task moved to ${statusColumns.find(col => col.id === newStatus)?.title}`)
    } catch (error) {
      toast.error('Failed to update task status')
      console.error('Failed to update task status:', error)
    }
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onDragEnd={handleDragEnd}
      onClick={() => onTaskClick(task)}
      className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 cursor-pointer hover:shadow-md transition-all duration-200 group"
    >
      {/* Drag Handle */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
            {task.title}
          </h4>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          priorityColors[task.priority]
        }`}>
          {task.priority}
        </span>
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <Clock className="h-3 w-3 mr-1" />
          <span>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
          {new Date(task.dueDate) < new Date() && (
            <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
              Overdue
            </span>
          )}
        </div>
      )}

      {/* Assignees */}
      {task.assignees && task.assignees.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 3).map((assignee, index) => (
              <div
                key={assignee._id}
                className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500 text-white text-xs font-medium ring-2 ring-white dark:ring-gray-700"
                title={assignee.name}
              >
                {assignee.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-300 text-gray-700 text-xs font-medium ring-2 ring-white dark:ring-gray-700">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {task.aiMetadata?.suggestedPriority && 
       task.aiMetadata.suggestedPriority !== task.priority && (
        <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
          <Brain className="h-3 w-3 mr-1" />
          AI suggests: {task.aiMetadata.suggestedPriority}
        </div>
      )}
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statusColumns.map((column) => (
        <div
          key={column.id}
          className={`rounded-lg p-4 min-h-[500px] transition-colors ${
            column.color
          } ${
            dragOverColumn === column.id 
              ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/30' 
              : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {column.title}
            </h3>
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-500 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-400">
              {tasksByStatus[column.id]?.length || 0}
            </span>
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            {tasksByStatus[column.id]?.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dragOverColumn === column.id ? 'Drop task here' : 'No tasks'}
                </p>
              </div>
            ) : (
              tasksByStatus[column.id]?.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Custom hook for drag and drop functionality
export const useDragAndDrop = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState<any>(null)

  const startDrag = (item: any) => {
    setIsDragging(true)
    setDraggedItem(item)
  }

  const endDrag = () => {
    setIsDragging(false)
    setDraggedItem(null)
  }

  return {
    isDragging,
    draggedItem,
    startDrag,
    endDrag
  }
}