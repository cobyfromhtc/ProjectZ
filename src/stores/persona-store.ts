'use client'

import { create } from 'zustand'

export interface Persona {
  id: string
  userId: string
  name: string
  avatarUrl: string | null
  bio: string | null
  isActive: boolean
  isOnline: boolean
  createdAt: string
  updatedAt: string
}

interface PersonaState {
  personas: Persona[]
  activePersona: Persona | null
  isLoading: boolean
  
  // Actions
  setPersonas: (personas: Persona[]) => void
  addPersona: (persona: Persona) => void
  updatePersona: (id: string, data: Partial<Persona>) => void
  removePersona: (id: string) => void
  setActivePersona: (persona: Persona | null) => void
  setLoading: (loading: boolean) => void
}

export const usePersonaStore = create<PersonaState>((set) => ({
  personas: [],
  activePersona: null,
  isLoading: true,
  
  setPersonas: (personas) => set({ 
    personas,
    activePersona: personas.find(p => p.isActive) || null,
    isLoading: false 
  }),
  
  addPersona: (persona) => set((state) => ({ 
    personas: [persona, ...state.personas],
    activePersona: persona.isActive ? persona : state.activePersona
  })),
  
  updatePersona: (id, data) => set((state) => ({ 
    personas: state.personas.map(p => 
      p.id === id ? { ...p, ...data } : p
    ),
    activePersona: state.activePersona?.id === id 
      ? { ...state.activePersona, ...data } 
      : state.activePersona
  })),
  
  removePersona: (id) => set((state) => ({ 
    personas: state.personas.filter(p => p.id !== id),
    activePersona: state.activePersona?.id === id 
      ? state.personas.find(p => p.id !== id && p.isActive) || null
      : state.activePersona
  })),
  
  setActivePersona: (persona) => set((state) => ({ 
    activePersona: persona,
    personas: state.personas.map(p => ({
      ...p,
      isActive: p.id === persona?.id,
      isOnline: p.id === persona?.id
    }))
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
}))
