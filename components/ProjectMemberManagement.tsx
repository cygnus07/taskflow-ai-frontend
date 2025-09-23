'use client'

import { useState, useEffect } from 'react'
import { projectAPI } from '@/lib/api'
import { 
  X, 
  Plus,
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  Search,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  Send,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Member {
  _id: string
  user: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  role: 'admin' | 'manager' | 'member'
  joinedAt: string
}

interface ProjectMemberManagementProps {
  projectId: string
  members: Member[]
  isOpen: boolean
  onClose: () => void
  onMembersUpdated: () => void
  currentUserRole: string
}

const roleConfig = {
  admin: {
    icon: Crown,
    label: 'Admin',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-800 dark:text-purple-100',
    description: 'Full access to all project features'
  },
  manager: {
    icon: Shield,
    label: 'Manager', 
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-800 dark:text-blue-100',
    description: 'Can manage tasks and team members'
  },
  member: {
    icon: User,
    label: 'Member',
    color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
    description: 'Can view and work on assigned tasks'
  }
}

export default function ProjectMemberManagement({ 
  projectId,
  members,
  isOpen, 
  onClose, 
  onMembersUpdated,
  currentUserRole 
}: ProjectMemberManagementProps) {
  const [loading, setLoading] = useState(false)
  
  // Add member form state
  const [addMemberEmail, setAddMemberEmail] = useState('')
  const [addMemberRole, setAddMemberRole] = useState<'manager' | 'member'>('member')
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddMember = async () => {
    if (!addMemberEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    if (!isValidEmail(addMemberEmail.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      await projectAPI.addMember(projectId, {
        email: addMemberEmail.trim(),
        role: addMemberRole
      })

      toast.success('Member added successfully')
      
      // Reset form
      setAddMemberEmail('')
      setAddMemberRole('member')
      
      // Refresh members list
      onMembersUpdated()
    } catch (error) {
      console.error('Failed to add member:', error)
      // Error is already shown by the API interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return
    }

    try {
      await projectAPI.removeMember(projectId, memberId)
      toast.success(`${memberName} removed from project`)
      onMembersUpdated()
    } catch (error) {
      console.error('Failed to remove member:', error)
      // Error is already shown by the API interceptor
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const canManageMembers = currentUserRole === 'admin' || currentUserRole === 'manager'
  
  const filteredMembers = members.filter(member =>
    member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Members ({members.length})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {/* Add Member Form */}
            {canManageMembers && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Member
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={addMemberEmail}
                        onChange={(e) => setAddMemberEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <select
                        value={addMemberRole}
                        onChange={(e) => setAddMemberRole(e.target.value as 'manager' | 'member')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      >
                        <option value="member">Member</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAddMember}
                    disabled={loading || !addMemberEmail.trim()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No members match your search' : 'No members found'}
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const RoleIcon = roleConfig[member.role]?.icon || User
                  
                  return (
                    <div key={member._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-medium">
                          {member.user.avatar ? (
                            <img
                              src={member.user.avatar}
                              alt={member.user.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            member.user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {member.user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.user.email}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Role Badge */}
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          roleConfig[member.role]?.color
                        }`}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleConfig[member.role]?.label}
                        </div>

                        {/* Remove Button */}
                        {canManageMembers && member.role !== 'admin' && (
                          <button
                            onClick={() => handleRemoveMember(member._id, member.user.name)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}