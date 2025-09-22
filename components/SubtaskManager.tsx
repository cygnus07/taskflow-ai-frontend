'use client'

import { useState, useEffect } from 'react'
import { taskAPI } from '@/lib/api'
import { 
  Plus, 
  Check, 
  X, 
  ChevronRight,
  ChevronDown,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Subtask {
  _id: string
  title: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  assignees?: Array<{
    _id: string
    name: string
    email: string
  }>
}

interface SubtaskManagerProps {
  parentTaskId: string
  projectId: string
  projectMembers: Array<{
    _id: string
    name: string
    email: string
  }>
  onSubtaskUpdate: () => void
}

export default function SubtaskManager({ 
  parentTaskId, 
  projectId, 
  projectMembers,
  onSubtaskUpdate 
}: SubtaskManagerProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expanded, setExpanded] = useState(true)
  
  // Form state for creating new subtask
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: '',
    assignees: [] as string[]
  })

  useEffect(() => {
    loadSubtasks()
  }, [parentTaskId])

  const loadSubtasks = async () => {
    try {
      setLoading(true)
      const { data } = await taskAPI.getSubtasks(parentTaskId)
      setSubtasks(data.subtasks || [])
    } catch (error) {
      console.error('Failed to load subtasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtask.title.trim()) return

    try {
      const subtaskData = {
        ...newSubtask,
        parentTaskId,
        dueDate: newSubtask.dueDate ? new Date(newSubtask.dueDate).toISOString() : undefined
      }

      await taskAPI.create(projectId, subtaskData)
      
      // Reset form
      setNewSubtask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignees: []
      })
      setShowCreateForm(false)
      
      // Reload subtasks and notify parent
      await loadSubtasks()
      onSubtaskUpdate()
      toast.success('Subtask created successfully')
    } catch (error) {
      console.error('Failed to create subtask:', error)
    }
  }

  const handleUpdateSubtaskStatus = async (subtaskId: string, newStatus: string) => {
    try {
      await taskAPI.updateStatus(subtaskId, newStatus)
      await loadSubtasks()
      onSubtaskUpdate()
      toast.success('Subtask status updated')
    } catch (error) {
      console.error('Failed to update subtask status:', error)
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm('Are you sure you want to delete this subtask?')) return

    try {
      await taskAPI.delete(subtaskId)
      await loadSubtasks()
      onSubtaskUpdate()
      toast.success('Subtask deleted')
    } catch (error) {
      console.error('Failed to delete subtask:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
    }
  }

  const completedCount = subtasks.filter(s => s.status === 'done').length
  const totalCount = subtasks.length

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="font-medium">
            Subtasks ({completedCount}/{totalCount})
          </span>
        </button>

        {expanded && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Subtask
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="px-4 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      {expanded && (
        <div className="p-4">
          {/* Create Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateSubtask} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Subtask title"
                    value={newSubtask.title}
                    onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    autoFocus
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Description (optional)"
                    value={newSubtask.description}
                    onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select
                      value={newSubtask.priority}
                      onChange={(e) => setNewSubtask({ ...newSubtask, priority: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="date"
                      value={newSubtask.dueDate}
                      onChange={(e) => setNewSubtask({ ...newSubtask, dueDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assign to:
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {projectMembers.map((member) => (
                      <label key={member._id} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={newSubtask.assignees.includes(member._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSubtask({ 
                                ...newSubtask, 
                                assignees: [...newSubtask.assignees, member._id] 
                              })
                            } else {
                              setNewSubtask({ 
                                ...newSubtask, 
                                assignees: newSubtask.assignees.filter(id => id !== member._id) 
                              })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {member.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newSubtask.title.trim()}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Subtask
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Subtasks List */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : subtasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No subtasks yet. Create one to break down this task!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subtasks.map((subtask) => (
                <div
                  key={subtask._id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  {/* Status Checkbox */}
                  <button
                    onClick={() => handleUpdateSubtaskStatus(
                      subtask._id, 
                      subtask.status === 'done' ? 'todo' : 'done'
                    )}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                      subtask.status === 'done'
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300 dark:border-gray-500 hover:border-green-600'
                    }`}
                  >
                    {subtask.status === 'done' && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`text-sm font-medium ${
                        subtask.status === 'done'
                          ? 'text-gray-500 dark:text-gray-400 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {subtask.title}
                      </h4>
                      
                      <button
                        onClick={() => handleDeleteSubtask(subtask._id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      {/* Status Badge */}
                      {subtask.status !== 'done' && (
                        <select
                          value={subtask.status}
                          onChange={(e) => handleUpdateSubtaskStatus(subtask._id, e.target.value)}
                          className={`text-xs px-2 py-0.5 rounded-full border-0 ${getStatusColor(subtask.status)}`}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      )}

                      {/* Priority Badge */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        getPriorityColor(subtask.priority)
                      }`}>
                        {subtask.priority}
                      </span>

                      {/* Due Date */}
                      {subtask.dueDate && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(subtask.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Assignees */}
                    {subtask.assignees && subtask.assignees.length > 0 && (
                      <div className="flex -space-x-1 mt-2">
                        {subtask.assignees.slice(0, 3).map((assignee, index) => (
                          <div
                            key={assignee._id}
                            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-500 text-white text-xs font-medium ring-1 ring-white dark:ring-gray-700"
                            title={assignee.name}
                          >
                            {assignee.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for use in task cards
export function SubtaskIndicator({ 
  parentTaskId, 
  onExpand 
}: { 
  parentTaskId: string
  onExpand?: () => void 
}) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubtasks = async () => {
      try {
        const { data } = await taskAPI.getSubtasks(parentTaskId)
        setSubtasks(data.subtasks || [])
      } catch (error) {
        console.error('Failed to load subtasks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubtasks()
  }, [parentTaskId])

  if (loading || subtasks.length === 0) return null

  const completedCount = subtasks.filter(s => s.status === 'done').length
  const totalCount = subtasks.length

  return (
    <button
      onClick={onExpand}
      className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
    >
      <Check className="h-3 w-3 mr-1" />
      {completedCount}/{totalCount} subtasks
    </button>
  )
}