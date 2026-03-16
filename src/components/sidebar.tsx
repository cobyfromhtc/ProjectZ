'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { usePersonas } from '@/hooks/use-personas'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, Compass, Plus, Crown, Sparkles, LogOut, Wand2, Check
} from 'lucide-react'

// Types
interface StorylineItem {
  id: string
  name: string
  iconUrl: string | null
  category: string
  role: string
  memberCount: number
  channels: { id: string; name: string }[]
}

interface SidebarProps {
  activeTab: 'home' | 'friends' | 'storylines' | 'chat'
  activeStorylineId: string | null
  onSelectTab: (tab: 'home' | 'friends' | 'storylines') => void
  onSelectStoryline: (storylineId: string) => void
  onCreatePersona: () => void
}

export function Sidebar({
  activeTab,
  activeStorylineId,
  onSelectTab,
  onSelectStoryline,
  onCreatePersona
}: SidebarProps) {
  const { user, logout } = useAuth()
  const { personas, activePersona, activatePersona } = usePersonas()
  
  const [storylines, setStorylines] = useState<StorylineItem[]>([])
  
  // Fetch joined storylines
  useEffect(() => {
    async function fetchStorylines() {
      try {
        const response = await fetch('/api/storylines/joined')
        if (response.ok) {
          const data = await response.json()
          setStorylines(data.storylines)
        }
      } catch (error) {
        console.error('Failed to fetch storylines:', error)
      }
    }
    fetchStorylines()
  }, [])
  
  return (
    <div className="w-64 persona-sidebar flex flex-col h-screen flex-shrink-0 relative">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
      
      {/* Header with Logo */}
      <div className="relative z-10 p-4 border-b border-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-fuchsia-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg persona-gradient-text">Chrona</h1>
            <p className="text-[10px] text-purple-400/60 tracking-wider">Roleplay Universe</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="p-3 space-y-1 relative z-10">
        {/* Discover */}
        <button
          onClick={() => onSelectTab('home')}
          className={`persona-nav-item w-full ${activeTab === 'home' ? 'persona-nav-item-active' : ''}`}
        >
          <Compass className="w-5 h-5" />
          <span className="font-medium">Discover</span>
        </button>
        
        {/* Friends */}
        <button
          onClick={() => onSelectTab('friends')}
          className={`persona-nav-item w-full ${activeTab === 'friends' ? 'persona-nav-item-active' : ''}`}
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Friends</span>
        </button>
        
        {/* Storylines */}
        <button
          onClick={() => onSelectTab('storylines')}
          className={`persona-nav-item w-full ${activeTab === 'storylines' ? 'persona-nav-item-active' : ''}`}
        >
          <Crown className="w-5 h-5" />
          <span className="font-medium">Storylines</span>
        </button>
      </div>
      
      {/* My Personas Section */}
      <div className="relative z-10 mt-2">
        <div className="px-4 flex items-center justify-between mb-2">
          <span className="persona-section-header">My Characters</span>
          <button 
            onClick={onCreatePersona}
            className="w-6 h-6 rounded-md flex items-center justify-center text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all"
            title="Create new character"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="px-3 space-y-1">
          {personas.length === 0 ? (
            <button
              onClick={onCreatePersona}
              className="w-full p-3 rounded-lg border border-dashed border-purple-500/30 flex items-center justify-center gap-2 text-purple-400/60 hover:text-purple-300 hover:border-purple-500/50 transition-all"
            >
              <Wand2 className="w-4 h-4" />
              <span className="text-sm">Create your first character</span>
            </button>
          ) : (
            <>
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => activatePersona(persona.id)}
                  className={`persona-dm-item w-full ${persona.isActive ? 'persona-dm-item-active border-l-2 border-l-purple-500' : ''}`}
                >
                  <Avatar className="w-8 h-8 border border-purple-500/30">
                    <AvatarImage src={persona.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/50 to-fuchsia-500/50 text-white text-xs font-medium">
                      {persona.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-purple-100 truncate">{persona.name}</p>
                  </div>
                  {persona.isActive && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
              <button
                onClick={onCreatePersona}
                className="w-full p-2 rounded-lg border border-purple-500/20 flex items-center justify-center gap-2 text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all text-xs"
              >
                <Plus className="w-3 h-3" />
                <span>New character</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Storylines Section */}
      <div className="flex-1 flex flex-col min-h-0 mt-4 relative z-10 overflow-hidden">
        {storylines.length > 0 && (
          <>
            <div className="px-4 flex items-center justify-between mb-2 flex-shrink-0">
              <span className="persona-section-header">My Storylines</span>
              <button
                onClick={() => onSelectTab('storylines')}
                className="text-xs text-purple-400/60 hover:text-purple-300 transition-colors"
              >
                View all
              </button>
            </div>
            <ScrollArea className="flex-1 px-3 min-h-0">
              <div className="space-y-1">
                {storylines.map((sl) => (
                  <button
                    key={sl.id}
                    onClick={() => onSelectStoryline(sl.id)}
                    className={`persona-dm-item w-full ${activeStorylineId === sl.id ? 'persona-dm-item-active' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center overflow-hidden border border-purple-500/30 flex-shrink-0">
                      {sl.iconUrl ? (
                        <img src={sl.iconUrl} alt={sl.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-xs">{sl.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-purple-100 truncate">{sl.name}</p>
                      <p className="text-xs text-purple-400/50">{sl.role}</p>
                    </div>
                    {sl.role === 'owner' && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
        
        {storylines.length === 0 && (
          <div className="px-3">
            <button
              onClick={() => onSelectTab('storylines')}
              className="w-full p-4 rounded-lg border border-dashed border-purple-500/30 flex flex-col items-center justify-center gap-2 text-purple-400/60 hover:text-purple-300 hover:border-purple-500/50 transition-all"
            >
              <Crown className="w-5 h-5" />
              <span className="text-sm">Join or create a storyline</span>
            </button>
          </div>
        )}
      </div>
      
      {/* User Panel */}
      <div className="persona-user-panel relative z-10 flex-shrink-0">
        <div className="persona-status persona-status-online">
          <Avatar className="w-10 h-10 border-2 border-purple-500/40 persona-avatar-glow">
            <AvatarImage src={activePersona?.avatarUrl || user?.avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white font-medium">
              {(activePersona?.name || user?.username)?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-purple-100 truncate">{activePersona?.name || user?.username}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-purple-400/70">Online</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-purple-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
