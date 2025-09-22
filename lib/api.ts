import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    const message = error.response?.data?.error || error.message || 'Something went wrong'
    toast.error(error.message)
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/login', data)
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token)
    }
    return res.data
  },
  
  register: async (data: any) => {
    const res = await api.post('/auth/register', data)
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token)
    }
    return res.data
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
    }
  },
  
  me: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },
}

export const projectAPI = {
  list: async (filters?: any) => {
    const res = await api.get('/projects', { params: filters })
    return res.data
  },
  
  get: async (id: string) => {
    const res = await api.get(`/projects/${id}`)
    return res.data
  },
  
  create: async (data: any) => {
    const res = await api.post('/projects', data)
    return res.data
  },
  
  update: async (id: string, data: any) => {
    const res = await api.put(`/projects/${id}`, data)
    return res.data
  },
  
  delete: async (id: string) => {
    const res = await api.delete(`/projects/${id}`)
    return res.data
  },
  
  addMember: async (projectId: string, data: { email: string; role: string }) => {
    const res = await api.post(`/projects/${projectId}/members`, data)
    return res.data
  },
  
  removeMember: async (projectId: string, memberId: string) => {
    const res = await api.delete(`/projects/${projectId}/members/${memberId}`)
    return res.data
  },
}

export const taskAPI = {
  list: async (projectId: string, filters?: any) => {
    const res = await api.get(`/projects/${projectId}/tasks`, { params: filters })
    return res.data
  },
  
  get: async (id: string) => {
    const res = await api.get(`/tasks/${id}`)
    return res.data
  },
  
  create: async (projectId: string, data: any) => {
    const res = await api.post(`/projects/${projectId}/tasks`, data)
    return res.data
  },
  
  update: async (id: string, data: any) => {
    const res = await api.put(`/tasks/${id}`, data)
    return res.data
  },
  
  updateStatus: async (id: string, status: string) => {
    const res = await api.patch(`/tasks/${id}/status`, { status })
    return res.data
  },
  
  delete: async (id: string) => {
    const res = await api.delete(`/tasks/${id}`)
    return res.data
  },
  
  addComment: async (id: string, text: string) => {
    const res = await api.post(`/tasks/${id}/comments`, { text })
    return res.data
  },
  
  addDependency: async (taskId: string, dependencyId: string) => {
    const res = await api.post(`/tasks/${taskId}/dependencies`, { dependencyId })
    return res.data
  },
  
  removeDependency: async (taskId: string, dependencyId: string) => {
    const res = await api.delete(`/tasks/${taskId}/dependencies/${dependencyId}`)
    return res.data
  },
  
  getSubtasks: async (taskId: string) => {
    const res = await api.get(`/tasks/${taskId}/subtasks`)
    return res.data
  },
}

export const aiAPI = {
  prioritizeTasks: async (projectId: string) => {
    const res = await api.post(`/projects/${projectId}/ai/prioritize`)
    return res.data
  },
  
  generateSchedule: async (projectId: string, applySchedule = false) => {
    const res = await api.post(`/projects/${projectId}/ai/schedule`, { applySchedule })
    return res.data
  },
  
  analyzeHealth: async (projectId: string) => {
    const res = await api.post(`/projects/${projectId}/ai/analyze-health`)
    return res.data
  },
}

export default api