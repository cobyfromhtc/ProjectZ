'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'

// Set personas online status
async function setOnlineStatus(isOnline: boolean) {
  try {
    await fetch('/api/personas/online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline }),
    })
  } catch (error) {
    console.error('Failed to update online status:', error)
  }
}

// Set offline using fetch with keepalive (for page unload)
function setOfflineOnExit() {
  fetch('/api/personas/online', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isOnline: false }),
    keepalive: true, // Ensures request completes even if page unloads
  })
}

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout } = useAuthStore()
  const hasSetOnline = useRef(false)
  
  // Fetch current session on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/me')
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to fetch session:', error)
        setUser(null)
      }
    }
    
    fetchSession()
  }, [setUser])
  
  // Set online status when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !hasSetOnline.current) {
      setOnlineStatus(true)
      hasSetOnline.current = true
    }
  }, [isAuthenticated, user])
  
  // Handle browser close/refresh - set offline
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated) {
        setOfflineOnExit()
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isAuthenticated) {
        // Page is hidden, set offline
        setOfflineOnExit()
      } else if (document.visibilityState === 'visible' && isAuthenticated) {
        // Page is visible again, set online
        setOnlineStatus(true)
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated])
  
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }
    
    setUser(data.user)
    // Set online after successful login
    await setOnlineStatus(true)
    hasSetOnline.current = true
    return data
  }
  
  const signup = async (email: string, username: string, password: string, confirmPassword: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, confirmPassword }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed')
    }
    
    setUser(data.user)
    // New users won't have personas yet, but set online anyway
    await setOnlineStatus(true)
    hasSetOnline.current = true
    return data
  }
  
  const handleLogout = useCallback(async () => {
    // Set offline before logging out
    await setOnlineStatus(false)
    hasSetOnline.current = false
    
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
  }, [logout])
  
  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout: handleLogout,
  }
}
