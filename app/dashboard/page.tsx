'use client'

import { useEffect, useState } from 'react'
import { projectAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data } = await projectAPI.list()
      setRecentProjects(data.projects.slice(0, 5))
      
      // Calculate stats
      const active = data.projects.filter((p: any) => p.status === 'active').length
      const totalTasks = data.projects.reduce((sum: number, p: any) => 
        sum + (p.metadata?.totalTasks || 0), 0
      )
      const completedTasks = data.projects.reduce((sum: number, p: any) => 
        sum + (p.metadata?.completedTasks || 0), 0
      )
      
      setStats({
        totalProjects: data.projects.length,
        activeProjects: active,
        totalTasks,
        completedTasks,
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Welcome back, {user?.name}!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpen className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Projects
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.totalProjects}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Active Projects
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.activeProjects}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Tasks
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.totalTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Completed Tasks
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.completedTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Recent Projects
          </h3>
          {recentProjects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No projects yet. Create your first project to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link
                  key={project._id}
                  href={`/dashboard/projects/${project._id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-4 rounded-lg transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {project.metadata?.totalTasks || 0} tasks • 
                        {project.members?.length || 0} members
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-6">
            <Link
              href="/dashboard/projects"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              View all projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}