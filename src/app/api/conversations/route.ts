import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Fetch all conversations for current user's active persona
export async function GET() {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get user's personas
    const userPersonas = await db.persona.findMany({
      where: { userId: user.id },
      select: { id: true }
    })
    const personaIds = userPersonas.map(p => p.id)
    
    // Get all conversations involving these personas
    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { personaAId: { in: personaIds } },
          { personaBId: { in: personaIds } },
        ]
      },
      include: {
        personaA: {
          include: { user: { select: { username: true } } }
        },
        personaB: {
          include: { user: { select: { username: true } } }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })
    
    // Transform to include "other persona" info
    const result = conversations.map(conv => {
      const isPersonaA = personaIds.includes(conv.personaAId)
      const otherPersona = isPersonaA ? conv.personaB : conv.personaA
      const myPersona = isPersonaA ? conv.personaA : conv.personaB
      
      return {
        id: conv.id,
        otherPersona: {
          id: otherPersona.id,
          name: otherPersona.name,
          avatarUrl: otherPersona.avatarUrl,
          username: otherPersona.user.username,
          isOnline: otherPersona.isOnline,
        },
        myPersona: {
          id: myPersona.id,
          name: myPersona.name,
        },
        lastMessage: conv.messages[0] || null,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      }
    })
    
    return NextResponse.json({ 
      success: true,
      conversations: result 
    })
    
  } catch (error) {
    console.error('Fetch conversations error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST - Start a new conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { targetPersonaId, myPersonaId } = body
    
    if (!targetPersonaId || !myPersonaId) {
      return NextResponse.json(
        { error: 'Missing persona IDs' },
        { status: 400 }
      )
    }
    
    // Verify myPersonaId belongs to user
    const myPersona = await db.persona.findFirst({
      where: { id: myPersonaId, userId: user.id }
    })
    
    if (!myPersona) {
      return NextResponse.json(
        { error: 'Invalid persona' },
        { status: 400 }
      )
    }
    
    // Check if target persona exists
    const targetPersona = await db.persona.findUnique({
      where: { id: targetPersonaId },
      include: { user: { select: { username: true } } }
    })
    
    if (!targetPersona) {
      return NextResponse.json(
        { error: 'Target persona not found' },
        { status: 404 }
      )
    }
    
    // Check if conversation already exists (in either direction)
    const existingConv = await db.conversation.findFirst({
      where: {
        OR: [
          { personaAId: myPersonaId, personaBId: targetPersonaId },
          { personaAId: targetPersonaId, personaBId: myPersonaId },
        ]
      }
    })
    
    if (existingConv) {
      // Return existing conversation
      return NextResponse.json({ 
        success: true,
        conversation: existingConv,
        isNew: false
      })
    }
    
    // Create new conversation
    const conversation = await db.conversation.create({
      data: {
        personaAId: myPersonaId,
        personaBId: targetPersonaId,
      },
      include: {
        personaA: {
          include: { user: { select: { username: true } } }
        },
        personaB: {
          include: { user: { select: { username: true } } }
        },
      }
    })
    
    return NextResponse.json({ 
      success: true,
      conversation,
      isNew: true
    })
    
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
