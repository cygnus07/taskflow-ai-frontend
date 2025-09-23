'use client'

import { useState } from 'react'
import { projectAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { 
  X, 
  AlertTriangle,
  Trash2,
  FileX,
  Users,
  CheckCircle2,
  Archive,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Project {
  _id: string
  name: string
  description?: string
  status: string
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

interface ProjectDeletionModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onProjectDeleted: () => void
  currentUserRole: string
}

export default function ProjectDeletionModal({ 
  project, 
  isOpen, 
  onClose, 
  onProjectDeleted,
  currentUserRole 
}: ProjectDeletionModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')

  const handleDeleteProject = async () => {
    if (confirmationText !== project.name) {
      toast.error('Project name confirmation does not match')
      return
    }

    setLoading(true)
    try {
      await projectAPI.delete(project._id)
      toast.success('Project deleted successfully')
      
      onProjectDeleted()
      onClose()
      
      // Redirect to projects list
      router.push('/dashboard/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
      // Error is already handled by API interceptor
    } finally {
      setLoading(false)
    }
  }

  const canDelete = currentUserRole === 'admin'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Project
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {project.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Permission Check */}
          {!canDelete ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Insufficient Permissions
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Only project administrators can delete projects.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Are you sure you want to delete this project?
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  This action cannot be undone. All project data, tasks, and history will be permanently removed.
                </p>
              </div>

              {/* Project Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Tasks: {project.metadata?.totalTasks || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Members: {project.members.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Archive className="h-4 w-4 text-purple-500" />
                    <span>Status: {project.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileX className="h-4 w-4 text-orange-500" />
                    <span>Completion: {project.metadata?.completedTasks || 0}/{project.metadata?.totalTasks || 0}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-50 dark:bg-red-800/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      This will permanently delete:
                    </h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <li>• All project tasks and subtasks</li>
                      <li>• Task comments and attachments</li>
                      <li>• Project member associations</li>
                      <li>• Project history and activity logs</li>
                      <li>• All related project data</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="bg-red-50 dark:bg-red-800/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                  To confirm deletion, please type the project name exactly as shown:
                </p>
                <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded border mb-4">
                  {project.name}
                </div>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Type project name here..."
                  autoComplete="off"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={loading || confirmationText !== project.name}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}