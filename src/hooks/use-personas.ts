'use client'

import { useEffect, useCallback } from 'react'
import { usePersonaStore, Persona } from '@/stores/persona-store'
import { useAuthStore } from '@/stores/auth-store'

export function usePersonas() {
  const { 
    personas, 
    activePersona, 
    isLoading, 
    setPersonas, 
    addPersona, 
    updatePersona, 
    removePersona, 
    setActivePersona, 
    setLoading 
  } = usePersonaStore()
  
  const { isAuthenticated } = useAuthStore()
  
  // Fetch personas on mount or when auth state changes
  useEffect(() => {
    async function fetchPersonas() {
      if (!isAuthenticated) {
        setPersonas([])
        return
      }
      
      try {
        const response = await fetch('/api/personas')
        
        if (response.ok) {
          const data = await response.json()
          setPersonas(data.personas)
        } else {
          setPersonas([])
        }
      } catch (error) {
        console.error('Failed to fetch personas:', error)
        setPersonas([])
      }
    }
    
    fetchPersonas()
  }, [isAuthenticated, setPersonas])
  
  // Create a new persona
  const createPersona = useCallback(async (name: string, avatarUrl: string | null, bio: string | null) => {
    const response = await fetch('/api/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatarUrl, bio }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create persona')
    }
    
    addPersona(data.persona)
    return data.persona
  }, [addPersona])
  
  // Update a persona
  const updatePersonaById = useCallback(async (id: string, updates: { name?: string; avatarUrl?: string | null; bio?: string | null }) => {
    const response = await fetch(`/api/personas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update persona')
    }
    
    updatePersona(id, data.persona)
    return data.persona
  }, [updatePersona])
  
  // Delete a persona
  const deletePersona = useCallback(async (id: string) => {
    const response = await fetch(`/api/personas/${id}`, {
      method: 'DELETE',
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete persona')
    }
    
    removePersona(id)
  }, [removePersona])
  
  // Activate a persona
  const activatePersona = useCallback(async (id: string) => {
    const response = await fetch(`/api/personas/${id}/activate`, {
      method: 'POST',
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to activate persona')
    }
    
    setActivePersona(data.persona)
    return data.persona
  }, [setActivePersona])
  
  // Upload avatar
  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload avatar')
    }
    
    return data.avatarUrl
  }, [])
  
  return {
    personas,
    activePersona,
    isLoading,
    createPersona,
    updatePersona: updatePersonaById,
    deletePersona,
    activatePersona,
    uploadAvatar,
  }
}
