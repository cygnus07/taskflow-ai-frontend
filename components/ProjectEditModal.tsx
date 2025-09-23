'use client'

import { useState, useEffect } from 'react'
import { projectAPI } from '@/lib/api'
import { 
  X, 
  Save,
  AlertTriangle,
  Calendar,
  Tag,
  FileText,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Project {
  _id: string
  name: string
  description?: string
  status: 'active' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate?: string
  endDate?: string
  budget?: number
  tags?: string[]
  color?: string
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

interface ProjectEditModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onProjectUpdated: (updatedProject: Project) => void
}

const projectColors = [
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500' },
  { name: 'Green', value: '#10B981', bg: 'bg-green-500' },
  { name: 'Purple', value: '#8B5CF6', bg: 'bg-purple-500' },
  { name: 'Red', value: '#EF4444', bg: 'bg-red-500' },
  { name: 'Orange', value: '#F59E0B', bg: 'bg-orange-500' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500' },
  { name: 'Teal', value: '#14B8A6', bg: 'bg-teal-500' },
]

export default function ProjectEditModal({ 
  project, 
  isOpen, 
  onClose, 
  onProjectUpdated 
}: ProjectEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    status: project.status,
    priority: project.priority,
    startDate: project.startDate ? project.startDate.split('T')[0] : '',
    endDate: project.endDate ? project.endDate.split('T')[0] : '',
    budget: project.budget || 0,
    color: project.color || '#3B82F6',
    tags: project.tags || []
  })
  
  const [newTag, setNewTag] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        priority: project.priority,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        budget: project.budget || 0,
        color: project.color || '#3B82F6',
        tags: project.tags || []
      })
      setHasChanges(false)
    }
  }, [isOpen, project])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    if (formData.endDate && formData.startDate && 
        new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be before start date')
      return
    }

    setLoading(true)
    try {
      const updateData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      }

      const { data } = await projectAPI.update(project._id, updateData)
      onProjectUpdated(data.project)
      toast.success('Project updated successfully')
      onClose()
    } catch (error) {
      console.error('Failed to update project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Project
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Describe your project..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline & Budget */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Timeline & Budget
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget ($)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Color & Tags */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Appearance & Tags
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {projectColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleInputChange('color', color.value)}
                        className={`w-8 h-8 rounded-full ${color.bg} border-2 ${
                          formData.color === color.value 
                            ? 'border-gray-900 dark:border-white' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Add a tag"
                    />
                    <button
                      onClick={addTag}
                      disabled={!newTag.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Statistics */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Project Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-gray-500 dark:text-gray-400">Total Tasks</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {project.metadata?.totalTasks || 0}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-gray-500 dark:text-gray-400">Completed Tasks</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {project.metadata?.completedTasks || 0}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-gray-500 dark:text-gray-400">Team Members</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {project.members.length}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-gray-500 dark:text-gray-400">Progress</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {project.metadata?.totalTasks 
                      ? Math.round(((project.metadata.completedTasks || 0) / project.metadata.totalTasks) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {hasChanges && (
            <div className="flex items-center text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          )}
          
          <div className="flex space-x-3 ml-auto">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !formData.name.trim() || !hasChanges}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}