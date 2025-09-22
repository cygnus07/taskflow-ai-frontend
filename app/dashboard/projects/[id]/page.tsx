'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { projectAPI, taskAPI, aiAPI } from '@/lib/api'
import { useSocket } from '@/lib/socket'
import { 
  Calendar, 
  CheckCircle, 
  Users, 
  Plus,
  Brain,
  Zap,
  Loader2,
  Settings,
  BarChart3,
  Filter
} from 'lucide-react'
import KanbanBoard from '@/components/KanbanBoard'
import TaskEditModal from '@/components/TaskEditModal'
import SubtaskManager, { SubtaskIndicator } from '@/components/SubtaskManager'
import toast from 'react-hot-toast'
import type { Task } from '@/types/task'

interface Project {
  _id: string
  name: string
  description?: string
  status: string
  createdAt: string
  members: Array<{
    _id: string
    user: {
      _id: string
      name: string
      email: string
    }
    role: string
  }>
  metadata?: {
    totalTasks: number
    completedTasks: number
  }
}

interface ProjectDetailPageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter()
  const [projectId, setProjectId] = useState<string | null>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const { socket, joinProject, leaveProject } = useSocket(token)

  // State
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  
  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showTaskEditModal, setShowTaskEditModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignee: ''
  })
  
  // Task creation form
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: '',
    assignees: [] as string[]
  })

  // Handle params resolution for Next.js 15
  useEffect(() => {
    const resolveParams = async () => {
      try {
        // Check if params is a Promise (Next.js 15 with async components)
        const resolvedParams = params instanceof Promise ? await params : params
        setProjectId(resolvedParams.id)
      } catch (error) {
        console.error('Error resolving params:', error)
        router.push('/dashboard/projects')
      }
    }
    
    resolveParams()
  }, [params, router])

  useEffect(() => {
    if (projectId) {
      loadProjectData()
      joinProject(projectId)
    }

    return () => {
      if (projectId) {
        leaveProject(projectId)
      }
    }
  }, [projectId])

  // Real-time event handlers
  useEffect(() => {
    if (!socket || !projectId) return

    const handleTaskCreated = (data: any) => {
      if (data.task.projectId === projectId) {
        setTasks(prev => [...prev, data.task])
        loadProjectData() // Refresh to update counts
      }
    }

    const handleTaskUpdated = (data: any) => {
      if (data.task.projectId === projectId) {
        setTasks(prev => prev.map(task => 
          task._id === data.task._id ? data.task : task
        ))
        loadProjectData() // Refresh to update counts
      }
    }

    const handleTaskDeleted = (data: any) => {
      if (data.projectId === projectId) {
        setTasks(prev => prev.filter(task => task._id !== data.taskId))
        loadProjectData() // Refresh to update counts
      }
    }

    socket.on('task:created', handleTaskCreated)
    socket.on('task:updated', handleTaskUpdated)
    socket.on('task:deleted', handleTaskDeleted)

    return () => {
      socket.off('task:created', handleTaskCreated)
      socket.off('task:updated', handleTaskUpdated)
      socket.off('task:deleted', handleTaskDeleted)
    }
  }, [socket, projectId])

  const loadProjectData = async () => {
    if (!projectId) return

    try {
      setLoading(true)
      
      // Load project and tasks in parallel
      const [projectRes, tasksRes] = await Promise.all([
        projectAPI.get(projectId),
        taskAPI.list(projectId, filters)
      ])

      setProject(projectRes.data.project)
      setTasks(tasksRes.data.tasks)
    } catch (error) {
      console.error('Failed to load project:', error)
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskForm.title.trim() || !projectId) return

    try {
      const taskData = {
        ...newTaskForm,
        dueDate: newTaskForm.dueDate ? new Date(newTaskForm.dueDate).toISOString() : undefined
      }

      await taskAPI.create(projectId, taskData)
      
      // Reset form
      setNewTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignees: []
      })
      setShowTaskModal(false)
      
      // Data will be updated via WebSocket
      toast.success('Task created successfully')
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setShowTaskEditModal(true)
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ))
    setSelectedTask(updatedTask)
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(task => task._id !== taskId))
    setSelectedTask(null)
    setShowTaskEditModal(false)
  }

  const handleAIPrioritize = async () => {
    if (!projectId) return
    
    setAiLoading(true)
    try {
      await aiAPI.prioritizeTasks(projectId)
      await loadProjectData()
      toast.success('AI prioritization completed')
    } catch (error) {
      console.error('AI prioritization failed:', error)
      toast.error('AI prioritization failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAISchedule = async () => {
    if (!projectId) return
    
    setAiLoading(true)
    try {
      await aiAPI.generateSchedule(projectId, false)
      toast.success('AI schedule generated')
    } catch (error) {
      console.error('AI scheduling failed:', error)
      toast.error('AI scheduling failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    // loadProjectData()
  }

  useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (projectId) {
      loadProjectData()
    }
  }, 300) // 300ms debounce

  return () => clearTimeout(timeoutId)
}, [filters, projectId])

  const projectMembers = project?.members.map(member => ({
    _id: member.user._id,
    name: member.user.name,
    email: member.user.email
  })) || []

  // Show loading while resolving params
  if (!projectId || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project not found</h2>
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-7xl mx-auto">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                project.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {project.status}
              </span>
            </div>
            
            {project.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            )}
            
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(project.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {project.metadata?.completedTasks || 0} / {project.metadata?.totalTasks || 0} tasks
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {project.members.length} members
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 lg:mt-0 flex flex-wrap gap-2">
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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange({ ...filters, priority: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          
          <select
            value={filters.assignee}
            onChange={(e) => handleFilterChange({ ...filters, assignee: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Assignees</option>
            {projectMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onTaskUpdated={loadProjectData}
      />

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create New Task
            </h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter task description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign to
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {projectMembers.map((member) => (
                    <label key={member._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newTaskForm.assignees.includes(member._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTaskForm({ 
                              ...newTaskForm, 
                              assignees: [...newTaskForm.assignees, member._id] 
                            })
                          } else {
                            setNewTaskForm({ 
                              ...newTaskForm, 
                              assignees: newTaskForm.assignees.filter(id => id !== member._id) 
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

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskForm.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {showTaskEditModal && selectedTask && (
        <TaskEditModal
          task={selectedTask}
          isOpen={showTaskEditModal}
          onClose={() => {
            setShowTaskEditModal(false)
            setSelectedTask(null)
          }}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          projectMembers={projectMembers}
          allTasks={tasks}
        />
      )}
    </div>
  )
}