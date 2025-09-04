import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.data?.error?.message) {
      toast.error(error.response.data.error.message)
    } else {
      toast.error('An unexpected error occurred')
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: async (data: any) => {
    const res = await api.post('/auth/register', data)
    if (res.data.data.token) {
      localStorage.setItem('token', res.data.data.token)
    }
    return res.data
  },
  
  login: async (data: any) => {
    const res = await api.post('/auth/login', data)
    if (res.data.data.token) {
      localStorage.setItem('token', res.data.data.token)
    }
    return res.data
  },
  
  logout: async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
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
  
  addMember: async (id: string, data: any) => {
    const res = await api.post(`/projects/${id}/members`, data)
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