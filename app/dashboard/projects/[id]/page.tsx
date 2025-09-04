'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { projectAPI, taskAPI, aiAPI } from '@/lib/api'
import { useSocket } from '@/lib/socket'
import { 
  Plus, 
  Brain, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  MessageSquare,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const { joinProject, leaveProject } = useSocket(token)
  
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimatedHours: '',
  })

  useEffect(() => {
    if (projectId) {
      loadProjectData()
      joinProject(projectId)
      
      return () => {
        leaveProject(projectId)
      }
    }
  }, [projectId])

  const loadProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectAPI.get(projectId),
        taskAPI.list(projectId),
      ])
      
      setProject(projectRes.data.project)
      setTasks(tasksRes.data.tasks)
    } catch (error) {
      console.error('Failed to load project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await taskAPI.create(projectId, taskForm)
      await loadProjectData()
      setShowTaskModal(false)
      setTaskForm({ title: '', description: '', priority: 'medium', estimatedHours: '' })
      toast.success('Task created successfully')
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await taskAPI.updateStatus(taskId, status)
      await loadProjectData()
      toast.success('Task status updated')
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleAIPrioritize = async () => {
    setAiLoading(true)
    try {
      await aiAPI.prioritizeTasks(projectId)
      await loadProjectData()
      toast.success('AI prioritization completed')
    } catch (error) {
      console.error('AI prioritization failed:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAISchedule = async () => {
    setAiLoading(true)
    try {
      await aiAPI.generateSchedule(projectId, false)
      toast.success('AI schedule generated')
    } catch (error) {
      console.error('AI scheduling failed:', error)
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return <div>Project not found</div>
  }

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done'),
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            )}
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(project.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {project.metadata?.completedTasks || 0} / {project.metadata?.totalTasks || 0} tasks
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAIPrioritize}
              disabled={aiLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 disabled:opacity-50"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Prioritize
            </button>
            <button
              onClick={handleAISchedule}
              disabled={aiLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              AI Schedule
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              <span className="capitalize">{status.replace('-', ' ')}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {statusTasks.length}
              </span>
            </h3>
            <div className="space-y-3">
              {statusTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      task.priority === 'urgent' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        : task.priority === 'high'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {task.dueDate && (
                    <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}

                  {task.assignees?.length > 0 && (
                    <div className="mt-2 flex -space-x-1">
                      {task.assignees.slice(0, 3).map((assignee: any, index: number) => (
                        <div
                          key={index}
                          className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500 text-white text-xs font-medium"
                          title={assignee.name}
                        >
                          {assignee.name?.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Metadata */}
                  {task.aiMetadata?.suggestedPriority && task.aiMetadata.suggestedPriority !== task.priority && (
                    <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                      <Brain className="h-3 w-3 mr-1" />
                      AI suggests: {task.aiMetadata.suggestedPriority}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create New Task
            </h2>
            <form onSubmit={handleCreateTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                {selectedTask.title}
              </h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedTask.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </h3>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={selectedTask.status}
                    onChange={(e) => {
                      handleUpdateTaskStatus(selectedTask._id, e.target.value)
                      setSelectedTask({ ...selectedTask, status: e.target.value })
                    }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {selectedTask.priority}
                  </p>
                </div>
              </div>

              {selectedTask.assignees?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assignees
                  </h3>
                  <div className="mt-1 flex space-x-2">
                    {selectedTask.assignees.map((assignee: any) => (
                      <span
                        key={assignee._id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {assignee.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.comments?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comments
                  </h3>
                  <div className="space-y-2">
                    {selectedTask.comments.map((comment: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.user?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.aiMetadata && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Insights
                  </h3>
                  <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    {selectedTask.aiMetadata.suggestedPriority && (
                      <p>Suggested Priority: {selectedTask.aiMetadata.suggestedPriority}</p>
                    )}
                    {selectedTask.aiMetadata.priorityScore && (
                      <p>Priority Score: {selectedTask.aiMetadata.priorityScore}/100</p>
                    )}
                    {selectedTask.aiMetadata.complexityScore && (
                      <p>Complexity: {selectedTask.aiMetadata.complexityScore}/10</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}