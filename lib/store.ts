import { create } from 'zustand'
import { authAPI } from './api'

interface User {
  _id: string
  email: string
  name: string
  role: string
  tenantId: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isCheckingAuth: boolean
  
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isCheckingAuth: true,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const res = await authAPI.login({ email, password })
      set({ user: res.data.user, isAuthenticated: true })
    } finally {
      set({ isLoading: false })
    }
  },
  
  register: async (data: any) => {
    set({ isLoading: true })
    try {
      const res = await authAPI.register(data)
      set({ user: res.data.user, isAuthenticated: true })
    } finally {
      set({ isLoading: false })
    }
  },
  
  logout: async () => {
    set({ isLoading: true })
    try {
      await authAPI.logout()
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },
  
  checkAuth: async () => {
    set({ isCheckingAuth: true})
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isAuthenticated: false, isCheckingAuth: false })
      return
    }
    
    try {
      const res = await authAPI.me()
      set({ user: res.data.user, isAuthenticated: true, isCheckingAuth: false })
    } catch {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false })
    }
  },
}))