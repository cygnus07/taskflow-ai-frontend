import { useEffect, useState } from 'react'
import io from 'socket.io-client'

import toast from 'react-hot-toast'
// import type { Socket } from 'socket.io-client'


const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'

interface TaskEventData {
  task: {
    title: string
  }
}

interface NotificationEventData {
  message: string
}

export const useSocket = (token: string | null) => {
const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!token) return

    const socketInstance = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    // Listen for real-time events
    socketInstance.on('task:created', (data: TaskEventData) => {
      toast.success(`New task created: ${data.task.title}`)
    })

    socketInstance.on('task:updated', (data: TaskEventData) => {
      toast(`Task updated: ${data.task.title}`, { icon: 'ℹ️' })
    })

    socketInstance.on('task:assigned:you', (data: TaskEventData) => {
      toast.success(`You've been assigned to: ${data.task.title}`)
    })

    socketInstance.on('notification:new', (data: NotificationEventData) => {
      toast(data.message, { icon: '🔔' })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [token])

  const joinProject = (projectId: string) => {
    socket?.emit('join:project', projectId)
  }

  const leaveProject = (projectId: string) => {
    socket?.emit('leave:project', projectId)
  }

  return {
    socket,
    isConnected,
    joinProject,
    leaveProject,
  }
}