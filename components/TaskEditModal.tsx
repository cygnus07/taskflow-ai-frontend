'use client'

import { useState, useEffect } from 'react'
import { taskAPI } from '@/lib/api'
import { 
  X, 
  Calendar, 
  User, 
  Tag, 
  AlertCircle,
  Save,
  Trash2,
  MessageCircle,
  Link,
  Plus
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
//   assignees: Array<{
//     _id: string
//     name: string
//     email: string
//   }>
//   comments?: Array<{
//     _id: string
//     text: string
//     user: {
//       name: string
//     }
//     createdAt: string
//   }>
//   dependencies?: Array<{
//     _id: string
//     title: string
//   }>
//   subtasks?: Array<{
//     _id: string
//     title: string
//     status: string
//   }>
// }

interface TaskEditModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onTaskUpdated: (updatedTask: Task) => void
  onTaskDeleted: (taskId: string) => void
  projectMembers: Array<{
    _id: string
    name: string
    email: string
  }>
  allTasks: Task[]
}

export default function TaskEditModal({ 
  task, 
  isOpen, 
  onClose, 
  onTaskUpdated, 
  onTaskDeleted,
  projectMembers,
  allTasks
}: TaskEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'subtasks' | 'dependencies'>('details')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    assignees: task.assignees?.map(a => a._id) || []
  })
  
  // Comments state
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState(task.comments || [])
  
  // Dependencies state
  const [availableDependencies, setAvailableDependencies] = useState<Task[]>([])
  const [selectedDependency, setSelectedDependency] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignees: task.assignees?.map(a => a._id) || []
      })
      setComments(task.comments || [])
      
      // Set available dependencies (exclude current task and its subtasks)
      const available = allTasks.filter(t => 
        t._id !== task._id && 
        !task.dependencies?.find(d => d._id === t._id)
      )
      setAvailableDependencies(available)
    }
  }, [isOpen, task, allTasks])

  const handleSave = async () => {
    setLoading(true)
    try {
      const updateData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      }
      
      const { data } = await taskAPI.update(task._id, updateData)
      onTaskUpdated(data.task)
      toast.success('Task updated successfully')
      onClose()
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await taskAPI.delete(task._id)
      onTaskDeleted(task._id)
      toast.success('Task deleted successfully')
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    try {
      const { data } = await taskAPI.addComment(task._id, newComment.trim())
      setComments(data.task.comments)
      setNewComment('')
      toast.success('Comment added')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleAddDependency = async () => {
    if (!selectedDependency) return
    
    try {
      await taskAPI.addDependency(task._id, selectedDependency)
      // Refresh task data to show new dependency
      const { data } = await taskAPI.get(task._id)
      onTaskUpdated(data.task)
      setSelectedDependency('')
      toast.success('Dependency added')
    } catch (error) {
      console.error('Failed to add dependency:', error)
    }
  }

  const handleRemoveDependency = async (dependencyId: string) => {
    try {
      await taskAPI.removeDependency(task._id, dependencyId)
      // Refresh task data
      const { data } = await taskAPI.get(task._id)
      onTaskUpdated(data.task)
      toast.success('Dependency removed')
    } catch (error) {
      console.error('Failed to remove dependency:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Task
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'details', label: 'Details', icon: Tag },
              { id: 'comments', label: 'Comments', icon: MessageCircle },
              { id: 'dependencies', label: 'Dependencies', icon: Link }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'comments' && comments.length > 0 && (
                    <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs px-2 py-0.5">
                      {comments.length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignees
                </label>
                <div className="space-y-2">
                  {projectMembers.map((member) => (
                    <label key={member._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.assignees.includes(member._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ 
                              ...formData, 
                              assignees: [...formData.assignees, member._id] 
                            })
                          } else {
                            setFormData({ 
                              ...formData, 
                              assignees: formData.assignees.filter(id => id !== member._id) 
                            })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {member.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Comment
                </label>
                <div className="flex space-x-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No comments yet. Be the first to add one!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Dependencies Tab */}
          {activeTab === 'dependencies' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Dependency
                </label>
                <div className="flex space-x-2">
                  <select
                    value={selectedDependency}
                    onChange={(e) => setSelectedDependency(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select a task...</option>
                    {availableDependencies.map((availableTask) => (
                      <option key={availableTask._id} value={availableTask._id}>
                        {availableTask.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddDependency}
                    disabled={!selectedDependency}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Current Dependencies
                </h4>
                {task.dependencies?.length === 0 || !task.dependencies ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No dependencies set
                  </p>
                ) : (
                  <div className="space-y-2">
                    {task.dependencies.map((dependency) => (
                      <div key={dependency._id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <span className="text-gray-900 dark:text-white">
                          {dependency.title}
                        </span>
                        <button
                          onClick={() => handleRemoveDependency(dependency._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center px-4 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Task
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !formData.title.trim()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Task
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}