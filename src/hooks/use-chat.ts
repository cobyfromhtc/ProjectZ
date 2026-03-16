'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth-store'
import { usePersonaStore } from '@/stores/persona-store'

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  sender: {
    id: string
    name: string
    avatarUrl: string | null
  }
  content: string
  imageUrl: string | null
  createdAt: string
}

interface UseChatOptions {
  conversationId: string | null
  onNewMessage?: (message: ChatMessage) => void
  onTyping?: (data: { isTyping: boolean; personaName: string }) => void
}

export function useChat({ conversationId, onNewMessage, onTyping }: UseChatOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isIdentified, setIsIdentified] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  
  const { user } = useAuthStore()
  const { activePersona } = usePersonaStore()
  
  // Connect to socket
  useEffect(() => {
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    })
    
    socketRef.current = socket
    
    socket.on('connect', () => {
      setIsConnected(true)
      console.log('Socket connected')
      
      // Identify ourselves
      if (user && activePersona) {
        socket.emit('identify', {
          userId: user.id,
          personaId: activePersona.id,
          personaName: activePersona.name
        })
      } else if (user) {
        socket.emit('identify', { userId: user.id })
      }
    })
    
    socket.on('disconnect', () => {
      setIsConnected(false)
      setIsIdentified(false)
      console.log('Socket disconnected')
    })
    
    socket.on('identified', () => {
      setIsIdentified(true)
      console.log('Socket identified')
    })
    
    socket.on('new-message', (message: ChatMessage) => {
      console.log('New message received:', message)
      onNewMessage?.(message)
    })
    
    socket.on('user-typing', (data: { conversationId: string; isTyping: boolean; personaName: string }) => {
      onTyping?.(data)
    })
    
    return () => {
      socket.disconnect()
    }
  }, [user?.id]) // Only reconnect when user changes
  
  // Join conversation when activePersona or conversationId changes
  useEffect(() => {
    const socket = socketRef.current
    if (socket && isConnected && conversationId) {
      // Leave previous conversations and join new one
      socket.emit('join-conversation', { conversationId })
    }
    
    return () => {
      if (socket && conversationId) {
        socket.emit('leave-conversation', { conversationId })
      }
    }
  }, [isConnected, conversationId])
  
  // Update identity when activePersona changes
  useEffect(() => {
    const socket = socketRef.current
    if (socket && isConnected && user && activePersona) {
      socket.emit('update-persona', {
        userId: user.id,
        personaId: activePersona.id,
        personaName: activePersona.name
      })
    }
  }, [isConnected, activePersona?.id, user?.id])
  
  // Send message via socket (after saving to DB via API)
  const broadcastMessage = useCallback((message: ChatMessage) => {
    const socket = socketRef.current
    if (socket && isConnected) {
      socket.emit('message-sent', {
        conversationId: message.conversationId,
        message
      })
    }
  }, [isConnected])
  
  // Typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    const socket = socketRef.current
    if (socket && isConnected && activePersona && conversationId) {
      socket.emit('typing', {
        conversationId,
        isTyping,
        personaName: activePersona.name
      })
    }
  }, [isConnected, activePersona, conversationId])
  
  return {
    isConnected,
    isIdentified,
    broadcastMessage,
    sendTyping,
  }
}
