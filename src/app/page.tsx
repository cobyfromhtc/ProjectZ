'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { usePersonas } from '@/hooks/use-personas'
import { useChat, ChatMessage } from '@/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Loader2, UserPlus, LogIn, LogOut, Users, MessageCircle, 
  User, Bell, Search, Settings, ChevronRight, Plus, Check,
  Edit2, Trash2, Camera, X, Send, ArrowLeft, MessageSquare,
  Sparkles, Zap, Image as ImageIcon, Wand2, Heart, Crown,
  BookOpen, Compass, Star
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Import components
import { Sidebar } from '@/components/sidebar'
import { DMSidebar } from '@/components/dm-sidebar'
import { FriendsPage } from '@/components/friends-page'
import { StorylinesPage } from '@/components/storylines-page'

// ==================== TYPES ====================
interface OnlinePersona {
  id: string
  name: string
  avatarUrl: string | null
  bio: string | null
  username: string
  isOnline: boolean
}

interface Conversation {
  id: string
  otherPersona: {
    id: string
    name: string
    avatarUrl: string | null
    username: string
    isOnline: boolean
  }
  myPersona: {
    id: string
    name: string
  }
  lastMessage: {
    content: string
    createdAt: string
  } | null
  lastMessageAt: string
  createdAt: string
}

// ==================== AUTH PAGE ====================
function AuthPage() {
  const { login, signup, setUser } = useAuth()
  
  const [signupForm, setSignupForm] = useState({ email: '', username: '', password: '', confirmPassword: '' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const data = await signup(signupForm.email, signupForm.username, signupForm.password, signupForm.confirmPassword)
      setUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const data = await login(loginForm.email, loginForm.password)
      setUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="min-h-screen persona-bg flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 persona-gradient-animated opacity-70" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Auth Card */}
      <div className="w-full max-w-md relative persona-glass rounded-2xl shadow-2xl persona-animate-scale">
        <div className="text-center space-y-4 p-6 pb-2">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-transform">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-fuchsia-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold persona-gradient-text">Chrona</h1>
              <p className="text-purple-400/60 text-sm mt-1">Roleplay Universe</p>
            </div>
          </div>
          <p className="text-purple-300/50 text-sm">
            Create your identity. Meet real people. Roleplay your story.
          </p>
        </div>
        
        <div className="p-6 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 persona-tabs mb-6 h-11">
              <TabsTrigger value="login" className="persona-tab data-[state=active]:persona-tab-active h-9 rounded-md transition-all">
                <LogIn className="w-4 h-4 mr-2" />Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="persona-tab data-[state=active]:persona-tab-active h-9 rounded-md transition-all">
                <UserPlus className="w-4 h-4 mr-2" />Sign Up
              </TabsTrigger>
            </TabsList>
            
            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm persona-animate-in">{error}</div>}
            
            <TabsContent value="login" className="persona-animate-in">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-purple-200/80">Email</Label>
                  <Input id="login-email" type="email" placeholder="your@email.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required className="persona-input h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-purple-200/80">Password</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required className="persona-input h-11" />
                </div>
                <button type="submit" className="btn-persona w-full h-11 text-base font-medium flex items-center justify-center" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Logging in...</> : <><LogIn className="w-4 h-4 mr-2" />Login</>}
                </button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="persona-animate-in">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-purple-200/80">Email</Label>
                  <Input id="signup-email" type="email" placeholder="your@email.com" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} required className="persona-input h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-purple-200/80">Username</Label>
                  <Input id="signup-username" type="text" placeholder="cooluser123" value={signupForm.username} onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })} required className="persona-input h-11" />
                  <p className="text-xs text-purple-400/50">Letters, numbers, and underscores only. 3-20 characters.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-purple-200/80">Password</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} required className="persona-input h-11" />
                  <p className="text-xs text-purple-400/50">At least 6 characters.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-purple-200/80">Confirm Password</Label>
                  <Input id="signup-confirm" type="password" placeholder="••••••••" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} required className="persona-input h-11" />
                </div>
                <button type="submit" className="btn-persona w-full h-11 text-base font-medium flex items-center justify-center" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : <><Zap className="w-4 h-4 mr-2" />Create Account</>}
                </button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// ==================== PERSONA MODAL ====================
function PersonaModal({ isOpen, onClose, persona, onSave }: { isOpen: boolean; onClose: () => void; persona?: { id: string; name: string; avatarUrl: string | null; bio: string | null } | null; onSave: (name: string, avatarUrl: string | null, bio: string | null) => void }) {
  const [name, setName] = useState(persona?.name || '')
  const [bio, setBio] = useState(persona?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(persona?.avatarUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadAvatar } = usePersonas()
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setError('')
    try {
      const url = await uploadAvatar(file)
      setAvatarUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setIsSaving(true)
    setError('')
    try {
      await onSave(name.trim(), avatarUrl, bio.trim() || null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleClose = () => { setName(persona?.name || ''); setBio(persona?.bio || ''); setAvatarUrl(persona?.avatarUrl || null); setError(''); onClose() }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="persona-modal max-w-md">
        <DialogHeader className="persona-modal-header">
          <DialogTitle className="text-xl font-bold persona-gradient-text flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            {persona ? 'Edit Character' : 'Create Character'}
          </DialogTitle>
          <DialogDescription className="text-purple-400/70">
            {persona ? 'Update your character identity.' : 'Create a new character to roleplay as.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="persona-modal-content space-y-6 pt-2">
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-colors" />
              <Avatar className="w-28 h-28 border-2 border-purple-500/40 relative persona-avatar-glow">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white text-2xl font-semibold">{name.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="absolute bottom-0 right-0 w-9 h-9 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center hover:opacity-90 transition-all shadow-lg hover:scale-110 border-2 border-[#1a1230]">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Camera className="w-4 h-4 text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
            <p className="text-xs text-purple-400/50">Click camera to upload avatar</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="persona-name" className="text-purple-200/80">Name *</Label>
            <Input id="persona-name" placeholder="Enter persona name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} className="persona-input h-11" />
            <p className="text-xs text-purple-400/50">{name.length}/50 characters</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="persona-bio" className="text-purple-200/80">Bio</Label>
            <Textarea id="persona-bio" placeholder="Describe your persona..." value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={4} className="persona-input resize-none" />
            <p className="text-xs text-purple-400/50">{bio.length}/500 characters</p>
          </div>
          
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={handleClose} className="btn-persona-ghost">Cancel</button>
            <button onClick={handleSave} disabled={isSaving || !name.trim()} className="btn-persona flex items-center gap-2 disabled:opacity-50">
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Sparkles className="w-4 h-4" />{persona ? 'Save Changes' : 'Create Character'}</>}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==================== MY PERSONAS MODAL ====================
function MyPersonasModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { personas, activePersona, isLoading, activatePersona, deletePersona, createPersona, updatePersona } = usePersonas()
  const [editingPersona, setEditingPersona] = useState<{ id: string; name: string; avatarUrl: string | null; bio: string | null } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const handleActivate = async (id: string) => { try { await activatePersona(id) } catch (err) { console.error('Failed to activate:', err) } }
  const handleDelete = async (id: string) => { if (!confirm('Are you sure you want to delete this persona?')) return; setDeletingId(id); try { await deletePersona(id) } catch (err) { console.error('Failed to delete:', err) } finally { setDeletingId(null) } }
  const handleSavePersona = async (name: string, avatarUrl: string | null, bio: string | null) => {
    if (editingPersona) { await updatePersona(editingPersona.id, { name, avatarUrl, bio }); setEditingPersona(null) }
    else { await createPersona(name, avatarUrl, bio); setShowCreateModal(false) }
  }
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="persona-modal max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="persona-modal-header flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold persona-gradient-text flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                My Characters
              </DialogTitle>
              <DialogDescription className="text-purple-400/60">
                Manage your character identities. Switch between characters to roleplay as different personas.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
            ) : personas.length === 0 ? (
              <div className="persona-empty-state persona-card py-12">
                <div className="persona-empty-state-icon">
                  <User className="w-8 h-8" />
                </div>
                <p className="text-purple-200">You haven&apos;t created any characters yet.</p>
                <p className="text-purple-400/50 text-sm mt-1 mb-4">Create your first character to start roleplaying!</p>
                <button onClick={() => setShowCreateModal(true)} className="btn-persona flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Your First Character
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {personas.map((persona) => (
                  <div key={persona.id} className={`persona-card persona-card-hover p-4 ${persona.isActive ? 'border-purple-500/40 bg-purple-500/5' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="w-14 h-14 border-2 border-purple-500/30">
                          <AvatarImage src={persona.avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white text-lg font-semibold">{persona.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {persona.isActive && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#1a1230] flex items-center justify-center"><Check className="w-3 h-3 text-white" /></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-purple-100 truncate">{persona.name}</h3>
                          {persona.isActive && <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Active</span>}
                        </div>
                        {persona.bio && <p className="text-sm text-purple-400/60 mt-1 line-clamp-2">{persona.bio}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        {!persona.isActive && (
                          <button onClick={() => handleActivate(persona.id)} className="btn-persona-ghost text-xs py-1.5 px-3 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Set Active
                          </button>
                        )}
                        <button onClick={() => setEditingPersona(persona)} className="w-9 h-9 rounded-lg flex items-center justify-center text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(persona.id)} disabled={deletingId === persona.id} className="w-9 h-9 rounded-lg flex items-center justify-center text-purple-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
                          {deletingId === persona.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {personas.length > 0 && (
            <div className="pt-4 border-t border-purple-500/15">
              <button onClick={() => setShowCreateModal(true)} className="btn-persona w-full flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Create New Character
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <PersonaModal isOpen={showCreateModal || !!editingPersona} onClose={() => { setShowCreateModal(false); setEditingPersona(null) }} persona={editingPersona} onSave={handleSavePersona} />
    </>
  )
}

// ==================== CHAT VIEW ====================
function ChatView({ conversation, onBack }: { conversation: Conversation; onBack: () => void }) {
  const { user } = useAuth()
  const { activePersona, uploadAvatar } = usePersonas()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingPersona, setTypingPersona] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { isConnected, sendTyping } = useChat({
    conversationId: conversation.id,
    onNewMessage: (message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, message]
      })
    },
    onTyping: (data) => {
      setIsTyping(data.isTyping)
      setTypingPersona(data.isTyping ? data.personaName : null)
    }
  })
  
  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(`/api/conversations/${conversation.id}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMessages()
  }, [conversation.id])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleTyping = useCallback(() => {
    sendTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 3000)
  }, [sendTyping])
  
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return }
    
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      if (response.ok) {
        const data = await response.json()
        setImagePreview(data.url)
      } else { alert('Failed to upload image') }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  
  const sendMessage = async () => {
    if ((!newMessage.trim() && !imagePreview) || !activePersona || isSending) return
    setIsSending(true)
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim(), imageUrl: imagePreview, senderPersonaId: activePersona.id })
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        setImagePreview(null)
        sendTyping(false)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }
  
  return (
    <div className="flex flex-col h-full persona-bg">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-purple-500/15 bg-[#12091f]/50 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="ghost" onClick={onBack} className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/10 gap-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="w-px h-8 bg-purple-500/20" />
        <div className="relative persona-status" style={conversation.otherPersona.isOnline ? {} : {}}>
          <Avatar className="w-10 h-10 border-2 border-purple-500/30">
            <AvatarImage src={conversation.otherPersona.avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500/50 to-fuchsia-500/50 text-white font-semibold">{conversation.otherPersona.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#12091f] ${conversation.otherPersona.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-purple-100">{conversation.otherPersona.name}</h3>
          <p className="text-xs text-purple-400/60">@{conversation.otherPersona.username}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
          <span className={`w-2 h-2 rounded-full ${conversation.otherPersona.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className={`text-xs font-medium ${conversation.otherPersona.isOnline ? 'text-emerald-400' : 'text-purple-400/60'}`}>{conversation.otherPersona.isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-purple-400/60">
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20"><MessageCircle className="w-10 h-10" /></div>
            <p className="text-lg font-medium text-purple-200">Start the conversation!</p>
            <p className="text-sm mt-1 text-purple-400/60">Say hello to {conversation.otherPersona.name}</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4 max-w-3xl mx-auto">
            {messages.map((message) => {
              const isMine = message.senderId === activePersona?.id
              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} persona-message`}>
                  <div className={`flex items-end gap-2.5 max-w-[75%] ${isMine ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8 border border-purple-500/30">
                      <AvatarImage src={message.sender.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500/50 to-fuchsia-500/50 text-white text-sm font-medium">{message.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`px-4 py-2.5 rounded-2xl ${isMine ? 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-br-md shadow-lg shadow-purple-500/20' : 'persona-card text-white rounded-bl-md'}`}>
                      {!isMine && <p className="text-xs text-purple-400 mb-1 font-medium">{message.sender.name}</p>}
                      {message.imageUrl && (
                        <div className="mb-2">
                          <img src={message.imageUrl} alt="Shared image" className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-purple-500/20" style={{ maxHeight: '300px', width: 'auto' }} onClick={() => window.open(message.imageUrl!, '_blank')} />
                        </div>
                      )}
                      {message.content && <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>}
                      <p className="text-xs opacity-50 mt-1">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            {isTyping && (
              <div className="flex justify-start persona-message">
                <div className="flex items-center gap-3 px-4 py-3 persona-card rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-purple-400/80">{typingPersona} is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Message Input */}
      <div className="sticky bottom-0 p-4 border-t border-purple-500/15 bg-[#12091f]/80 backdrop-blur-sm">
        {!activePersona ? (
          <div className="text-center py-3 persona-card rounded-xl"><p className="text-purple-400/60 text-sm">Create and activate a persona to send messages</p></div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg border border-purple-500/30" />
                <button onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-400 transition-colors shadow-lg"><X className="w-4 h-4" /></button>
              </div>
            )}
            <div className="flex gap-3 items-center">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage || isSending} className="text-purple-400 hover:text-purple-200 hover:bg-purple-500/10 rounded-xl h-11 w-11 flex-shrink-0 border border-purple-500/20">
                {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              </Button>
              <div className="flex-1 relative">
                <Textarea placeholder="Type a message..." value={newMessage} onChange={(e) => { setNewMessage(e.target.value); handleTyping() }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} className="w-full persona-input resize-none h-11 min-h-[44px] max-h-[120px] rounded-xl py-2.5 px-4" disabled={isSending} />
              </div>
              <Button onClick={sendMessage} disabled={(!newMessage.trim() && !imagePreview) || isSending} className="btn-persona h-11 w-11 rounded-xl flex-shrink-0 px-0">
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== HOME PAGE (Discovery) ====================
function HomePageContent({ onStartChat }: { onStartChat: (conv: Conversation) => void }) {
  const { user } = useAuth()
  const { personas, activePersona, isLoading: personasLoading, createPersona } = usePersonas()
  const [activeFilter, setActiveFilter] = useState('new')
  const [showPersonasModal, setShowPersonasModal] = useState(false)
  const [showCreatePersonaModal, setShowCreatePersonaModal] = useState(false)
  const [onlinePersonas, setOnlinePersonas] = useState<OnlinePersona[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(true)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  
  useEffect(() => {
    async function fetchDiscovery() {
      try {
        const response = await fetch(`/api/discovery?filter=${activeFilter}`)
        if (response.ok) {
          const data = await response.json()
          setOnlinePersonas(data.personas)
        }
      } catch (error) {
        console.error('Failed to fetch discovery:', error)
      } finally {
        setIsLoadingDiscovery(false)
      }
    }
    fetchDiscovery()
  }, [activeFilter])
  
  useEffect(() => {
    async function fetchConversations() {
      try {
        const response = await fetch('/api/conversations')
        if (response.ok) {
          const data = await response.json()
          setConversations(data.conversations)
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      } finally {
        setIsLoadingConversations(false)
      }
    }
    if (personas.length > 0) fetchConversations()
  }, [personas.length])
  
  const startConversation = async (targetPersonaId: string) => {
    if (!activePersona) { alert('Please create and activate a persona first!'); return }
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPersonaId, myPersonaId: activePersona.id })
      })
      if (response.ok) {
        const data = await response.json()
        const convResponse = await fetch('/api/conversations')
        if (convResponse.ok) {
          const convData = await convResponse.json()
          setConversations(convData.conversations)
          const newConv = convData.conversations.find((c: Conversation) => c.id === data.conversation.id)
          if (newConv) onStartChat(newConv)
        }
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }
  
  const handleSavePersona = async (name: string, avatarUrl: string | null, bio: string | null) => {
    await createPersona(name, avatarUrl, bio)
    setShowCreatePersonaModal(false)
  }
  
  return (
    <div className="flex flex-col h-full persona-bg">
      {/* Header */}
      <div className="h-14 border-b border-purple-500/15 flex items-center px-4 bg-[#12091f]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-purple-100">Discover</span>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowPersonasModal(true)} className="btn-persona flex items-center gap-2 text-sm py-2">
            <User className="w-4 h-4" /> My Characters
          </button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {/* No Persona Warning */}
        {!personasLoading && personas.length === 0 && (
          <div className="persona-card persona-card-hover mb-6 p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 flex items-center justify-center border border-purple-500/20">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-100">Create Your First Character</h3>
                <p className="text-purple-400/60 text-sm">You need a character to start chatting!</p>
              </div>
              <button onClick={() => setShowCreatePersonaModal(true)} className="btn-persona flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create
              </button>
            </div>
          </div>
        )}
        
        {/* Filter Tabs */}
        <div className="persona-tabs inline-flex mb-4">
          {['new', 'following', 'followers'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`persona-tab ${activeFilter === filter ? 'persona-tab-active' : ''}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        
        <p className="text-sm text-purple-400/60 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Showing personas that are currently online
        </p>
        
        {/* Discovery Grid */}
        {isLoadingDiscovery ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : onlinePersonas.length === 0 ? (
          <div className="persona-empty-state persona-card py-12">
            <div className="persona-empty-state-icon">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-purple-200">No one is online right now.</p>
            <p className="text-purple-400/60 text-sm mt-1">Check back later or invite friends!</p>
          </div>
        ) : (
          <TooltipProvider>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {onlinePersonas.map((persona) => (
                <div key={persona.id} className="persona-card persona-card-hover overflow-hidden cursor-pointer group">
                  <div className="relative pt-4 pb-2 flex justify-center">
                    <div className="relative persona-status persona-status-online">
                      <Avatar className="w-16 h-16 border-2 border-purple-500/40 group-hover:border-purple-400/60 transition-colors">
                        <AvatarImage src={persona.avatarUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white text-xl font-semibold">{persona.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="px-3 pb-3 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-medium text-purple-100 truncate text-sm cursor-help">{persona.name}</h3>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="persona-tooltip max-w-[200px] p-3">
                        <p className="font-medium text-purple-300 mb-1">{persona.name}</p>
                        <p className="text-xs text-purple-400/60">@{persona.username}</p>
                        {persona.bio && <p className="text-xs text-purple-300/70 mt-2 line-clamp-3">{persona.bio}</p>}
                      </TooltipContent>
                    </Tooltip>
                    <p className="text-xs text-purple-400/50 mt-0.5 truncate">@{persona.username}</p>
                    <button onClick={() => startConversation(persona.id)} className="btn-persona w-full mt-2 text-xs py-2">
                      <MessageSquare className="w-3 h-3 mr-1" /> Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        )}
      </ScrollArea>
      
      <MyPersonasModal isOpen={showPersonasModal} onClose={() => setShowPersonasModal(false)} />
      <PersonaModal isOpen={showCreatePersonaModal} onClose={() => setShowCreatePersonaModal(false)} onSave={handleSavePersona} />
    </div>
  )
}

// ==================== MAIN APP ====================
function MainApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'friends' | 'storylines' | 'chat'>('home')
  const [activeChat, setActiveChat] = useState<Conversation | null>(null)
  const [activeStorylineId, setActiveStorylineId] = useState<string | null>(null)
  const [showCreatePersonaModal, setShowCreatePersonaModal] = useState(false)
  const { createPersona } = usePersonas()
  
  // Handle selecting a chat from sidebar
  const handleSelectChat = async (conversationId: string) => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        const conv = data.conversations.find((c: Conversation) => c.id === conversationId)
        if (conv) {
          setActiveChat(conv)
          setActiveTab('chat')
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error)
    }
  }
  
  // Handle selecting a storyline
  const handleSelectStoryline = (storylineId: string) => {
    setActiveStorylineId(storylineId)
    // For now, just go to storylines page
    setActiveTab('storylines')
  }
  
  // Handle starting a chat from discovery
  const handleStartChat = (conv: Conversation) => {
    setActiveChat(conv)
    setActiveTab('chat')
  }
  
  // Handle creating persona
  const handleSavePersona = async (name: string, avatarUrl: string | null, bio: string | null) => {
    await createPersona(name, avatarUrl, bio)
    setShowCreatePersonaModal(false)
  }
  
  return (
    <div className="flex h-screen persona-bg">
      {/* Main Sidebar - Navigation & Personas */}
      <Sidebar
        activeTab={activeTab}
        activeStorylineId={activeStorylineId}
        onSelectTab={(tab) => {
          setActiveTab(tab)
          if (tab !== 'chat') setActiveChat(null)
        }}
        onSelectStoryline={handleSelectStoryline}
        onCreatePersona={() => setShowCreatePersonaModal(true)}
      />
      
      {/* DM Sidebar - Messages */}
      <DMSidebar
        activeChatId={activeChat?.id || null}
        onSelectChat={handleSelectChat}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeTab === 'chat' && activeChat ? (
          <ChatView conversation={activeChat} onBack={() => { setActiveChat(null); setActiveTab('home') }} />
        ) : activeTab === 'friends' ? (
          <FriendsPage />
        ) : activeTab === 'storylines' ? (
          <StorylinesPage onViewStoryline={handleSelectStoryline} />
        ) : (
          <HomePageContent onStartChat={handleStartChat} />
        )}
      </div>
      
      {/* Create Persona Modal */}
      <PersonaModal 
        isOpen={showCreatePersonaModal} 
        onClose={() => setShowCreatePersonaModal(false)} 
        onSave={handleSavePersona} 
      />
    </div>
  )
}

// ==================== MAIN PAGE ====================
export default function Page() {
  const { isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen persona-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-fuchsia-400 animate-pulse" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) return <AuthPage />
  return <MainApp />
}
