import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Store connected users with their persona info
interface ConnectedUser {
  socketId: string
  userId: string
  activePersonaId: string | null
  activePersonaName: string | null
}

const connectedUsers = new Map<string, ConnectedUser>()

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`)

  // User identifies themselves
  socket.on('identify', (data: { userId: string; personaId?: string; personaName?: string }) => {
    const { userId, personaId, personaName } = data
    
    const userInfo: ConnectedUser = {
      socketId: socket.id,
      userId,
      activePersonaId: personaId || null,
      activePersonaName: personaName || null
    }
    connectedUsers.set(socket.id, userInfo)
    
    socket.emit('identified', { success: true })
    console.log(`User ${userId} identified with persona ${personaName || 'none'}`)
  })

  // Join a conversation room
  socket.on('join-conversation', (data: { conversationId: string }) => {
    socket.join(`conversation:${data.conversationId}`)
    socket.emit('joined-conversation', { conversationId: data.conversationId })
    console.log(`Socket ${socket.id} joined conversation ${data.conversationId}`)
  })

  // Leave a conversation room
  socket.on('leave-conversation', (data: { conversationId: string }) => {
    socket.leave(`conversation:${data.conversationId}`)
    console.log(`Socket ${socket.id} left conversation ${data.conversationId}`)
  })

  // Broadcast new message to conversation
  socket.on('message-sent', (data: { 
    conversationId: string
    message: {
      id: string
      conversationId: string
      senderId: string
      sender: { id: string; name: string; avatarUrl: string | null }
      content: string
      createdAt: string
    }
  }) => {
    const { conversationId, message } = data
    // Broadcast to all other users in the conversation
    socket.to(`conversation:${conversationId}`).emit('new-message', message)
    console.log(`Message broadcast to conversation ${conversationId}`)
  })

  // Typing indicator
  socket.on('typing', (data: { conversationId: string; isTyping: boolean; personaName: string }) => {
    const { conversationId, isTyping, personaName } = data
    socket.to(`conversation:${conversationId}`).emit('user-typing', {
      conversationId,
      isTyping,
      personaName,
    })
  })

  // Update active persona
  socket.on('update-persona', (data: { userId: string; personaId: string; personaName: string }) => {
    const userInfo = connectedUsers.get(socket.id)
    if (userInfo && userInfo.userId === data.userId) {
      userInfo.activePersonaId = data.personaId
      userInfo.activePersonaName = data.personaName
      console.log(`User ${data.userId} switched to persona ${data.personaName}`)
    }
  })

  // Disconnect
  socket.on('disconnect', () => {
    const userInfo = connectedUsers.get(socket.id)
    if (userInfo) {
      connectedUsers.delete(socket.id)
      console.log(`User disconnected: ${userInfo.userId}`)
    } else {
      console.log(`Unknown user disconnected: ${socket.id}`)
    }
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Chat WebSocket server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...')
  httpServer.close(() => {
    console.log('WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...')
  httpServer.close(() => {
    console.log('WebSocket server closed')
    process.exit(0)
  })
})
