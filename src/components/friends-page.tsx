'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, UserPlus, Clock, Ban, Star, Search, X, MessageCircle,
  Check, Sparkles, Heart, Send
} from 'lucide-react'

interface FriendUser {
  id: string
  friendId: string
  username: string
  avatarUrl: string | null
  isFavourite: boolean
  activePersona: {
    id: string
    name: string
    avatarUrl: string | null
    isOnline: boolean
  } | null
}

interface PendingRequest {
  id: string
  sender: {
    id: string
    username: string
    avatarUrl: string | null
  }
}

interface BlockedUser {
  id: string
  blockedAt: string
  user: {
    id: string
    username: string
    avatarUrl: string | null
  }
}

type TabType = 'all' | 'online' | 'pending' | 'blocked' | 'favourites'

export function FriendsPage() {
  const { user } = useAuth()
  
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [friends, setFriends] = useState<FriendUser[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [addFriendUsername, setAddFriendUsername] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [friendsRes, requestsRes, blockedRes] = await Promise.all([
        fetch('/api/friends'),
        fetch('/api/friends/requests'),
        fetch('/api/friends/blocked')
      ])
      
      if (friendsRes.ok) {
        const data = await friendsRes.json()
        setFriends(data.friends)
      }
      
      if (requestsRes.ok) {
        const data = await requestsRes.json()
        setPendingRequests(data.received)
      }
      
      if (blockedRes.ok) {
        const data = await blockedRes.json()
        setBlockedUsers(data.blocked)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [])
  
  // Send friend request
  const handleSendRequest = async () => {
    if (!addFriendUsername.trim()) return
    
    setIsSending(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: addFriendUsername.trim() })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setAddFriendUsername('')
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send request' })
    } finally {
      setIsSending(false)
    }
  }
  
  // Accept friend request
  const handleAccept = async (requestId: string) => {
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })
      
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to accept request:', error)
    }
  }
  
  // Decline friend request
  const handleDecline = async (requestId: string) => {
    try {
      const response = await fetch('/api/friends/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })
      
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to decline request:', error)
    }
  }
  
  // Remove friend
  const handleRemove = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return
    
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      })
      
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to remove friend:', error)
    }
  }
  
  // Toggle favourite
  const handleToggleFavourite = async (friendId: string, isFavourite: boolean) => {
    try {
      const response = await fetch('/api/friends/favourite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId, isFavourite: !isFavourite })
      })
      
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to toggle favourite:', error)
    }
  }
  
  // Block user
  const handleBlock = async (userId: string) => {
    if (!confirm('Are you sure you want to block this user? They will not be able to message you.')) return
    
    try {
      const response = await fetch('/api/friends/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }
  
  // Unblock user
  const handleUnblock = async (userId: string) => {
    try {
      const response = await fetch('/api/friends/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to unblock user:', error)
    }
  }
  
  // Filter friends by tab
  const getFilteredFriends = () => {
    switch (activeTab) {
      case 'online':
        return friends.filter(f => f.activePersona?.isOnline)
      case 'favourites':
        return friends.filter(f => f.isFavourite)
      case 'pending':
        return []
      case 'blocked':
        return []
      default:
        return friends
    }
  }
  
  const filteredFriends = getFilteredFriends()
  
  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'all', label: 'All', icon: <Users className="w-4 h-4" />, count: friends.length },
    { id: 'online', label: 'Online', icon: <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> },
    { id: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" />, count: pendingRequests.length },
    { id: 'blocked', label: 'Blocked', icon: <Ban className="w-4 h-4" />, count: blockedUsers.length },
    { id: 'favourites', label: 'Favourites', icon: <Heart className="w-4 h-4" /> },
  ]
  
  return (
    <div className="flex flex-col h-full persona-bg">
      {/* Header */}
      <div className="h-14 border-b border-purple-500/15 flex items-center px-4 gap-4 bg-[#12091f]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-purple-100">Friends</span>
        </div>
        <div className="w-px h-6 bg-purple-500/20" />
        
        {/* Tabs */}
        <div className="persona-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`persona-tab flex items-center gap-2 ${activeTab === tab.id ? 'persona-tab-active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs bg-fuchsia-500/30 text-fuchsia-200 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="ml-auto">
          <button
            onClick={() => setShowAddFriend(!showAddFriend)}
            className="btn-persona flex items-center gap-2 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
        </div>
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 max-w-4xl mx-auto">
          {/* Add Friend Section */}
          {showAddFriend && (
            <div className="persona-card persona-card-hover mb-6">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-100">Add Friend</h3>
                    <p className="text-sm text-purple-400/70">Connect with other roleplayers</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter username..."
                    value={addFriendUsername}
                    onChange={(e) => setAddFriendUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                    className="persona-input flex-1"
                  />
                  <button 
                    onClick={handleSendRequest}
                    disabled={isSending || !addFriendUsername.trim()}
                    className="btn-persona flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Request
                  </button>
                </div>
                {message && (
                  <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {message.text}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Pending Requests */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <span className="persona-section-header text-sm">Pending Requests</span>
                <span className="persona-badge persona-badge-primary">{pendingRequests.length}</span>
              </div>
              {pendingRequests.length === 0 ? (
                <div className="persona-empty-state persona-card">
                  <div className="persona-empty-state-icon">
                    <Clock className="w-6 h-6" />
                  </div>
                  <p className="text-purple-300/60">No pending requests</p>
                  <p className="text-xs text-purple-400/40 mt-1">Friend requests will appear here</p>
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="persona-card persona-card-hover p-4 flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-purple-500/30">
                      <AvatarImage src={req.sender.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500/50 to-fuchsia-500/50 text-white font-medium">
                        {req.sender.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-purple-100">{req.sender.username}</p>
                      <p className="text-xs text-purple-400/60">Sent you a friend request</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="btn-persona flex items-center gap-1.5 text-sm py-2"
                      >
                        <Check className="w-4 h-4" /> Accept
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="btn-persona-ghost flex items-center gap-1.5 text-sm py-2"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Blocked Users */}
          {activeTab === 'blocked' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <span className="persona-section-header text-sm">Blocked Users</span>
                <span className="persona-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{blockedUsers.length}</span>
              </div>
              {blockedUsers.length === 0 ? (
                <div className="persona-empty-state persona-card">
                  <div className="persona-empty-state-icon">
                    <Ban className="w-6 h-6" />
                  </div>
                  <p className="text-purple-300/60">No blocked users</p>
                  <p className="text-xs text-purple-400/40 mt-1">Blocked users will appear here</p>
                </div>
              ) : (
                blockedUsers.map(block => (
                  <div key={block.id} className="persona-card p-4 flex items-center gap-4 border-red-500/20">
                    <Avatar className="w-12 h-12 border-2 border-red-500/30 grayscale">
                      <AvatarImage src={block.user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-red-500/50 to-red-600/50 text-white font-medium">
                        {block.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-purple-100">{block.user.username}</p>
                      <p className="text-xs text-red-400/60">Blocked</p>
                    </div>
                    <button
                      onClick={() => handleUnblock(block.user.id)}
                      className="btn-persona-ghost text-sm py-2"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Friends List */}
          {activeTab !== 'pending' && activeTab !== 'blocked' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <span className="persona-section-header text-sm">
                  {activeTab === 'favourites' ? 'Favourite Friends' : activeTab === 'online' ? 'Online Now' : 'All Friends'}
                </span>
                <span className="persona-badge persona-badge-primary">{filteredFriends.length}</span>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="persona-empty-state persona-card">
                  <div className="persona-empty-state-icon">
                    {activeTab === 'favourites' ? <Heart className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <p className="text-purple-300/60">
                    {activeTab === 'favourites' 
                      ? 'No favourite friends yet'
                      : activeTab === 'online'
                      ? 'No friends online right now'
                      : 'No friends yet'}
                  </p>
                  <p className="text-xs text-purple-400/40 mt-1">
                    {activeTab === 'favourites' 
                      ? 'Star a friend to add them to favourites!'
                      : activeTab === 'online'
                      ? 'Friends will appear here when they come online'
                      : 'Add some friends to get started!'}
                  </p>
                </div>
              ) : (
                filteredFriends.map(friend => (
                  <div key={friend.id} className="persona-card persona-card-hover p-4 flex items-center gap-4 group">
                    <div className={`persona-status ${friend.activePersona?.isOnline ? 'persona-status-online' : 'persona-status-offline'}`}>
                      <Avatar className="w-12 h-12 border-2 border-purple-500/30">
                        <AvatarImage src={friend.activePersona?.avatarUrl || friend.avatarUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500/50 to-fuchsia-500/50 text-white font-medium">
                          {(friend.activePersona?.name || friend.username)?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {friend.isFavourite && <Star className="w-3.5 h-3.5 persona-favourite fill-current" />}
                        <p className="font-semibold text-purple-100">
                          {friend.activePersona?.name || friend.username}
                        </p>
                      </div>
                      <p className="text-xs text-purple-400/60 truncate">
                        @{friend.username} {friend.activePersona && `· as ${friend.activePersona.name}`}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleFavourite(friend.friendId, friend.isFavourite)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                          friend.isFavourite 
                            ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' 
                            : 'text-purple-400/60 hover:text-amber-400 hover:bg-amber-500/10'
                        }`}
                        title={friend.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                      >
                        <Star className={`w-4 h-4 ${friend.isFavourite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all"
                        title="Message"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(friend.friendId)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-purple-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Remove friend"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
