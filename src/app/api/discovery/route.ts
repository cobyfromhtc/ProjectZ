import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// Force reload after Prisma client regeneration
// GET - Fetch online personas for discovery
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'new'
    
    // Get current user's active persona to exclude from results
    const currentUserPersonas = await db.persona.findMany({
      where: { userId: user.id },
      select: { id: true }
    })
    const currentUserPersonaIds = currentUserPersonas.map(p => p.id)
    
    let personas = []
    
    if (filter === 'following') {
      // Get personas of users that current user follows
      const follows = await db.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true }
      })
      const followingIds = follows.map(f => f.followingId)
      
      personas = await db.persona.findMany({
        where: {
          userId: { in: followingIds },
          id: { notIn: currentUserPersonaIds },
          isOnline: true,
        },
        include: {
          user: {
            select: { username: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      })
    } else if (filter === 'followers') {
      // Get personas of users that follow current user
      const followers = await db.follow.findMany({
        where: { followingId: user.id },
        select: { followerId: true }
      })
      const followerIds = followers.map(f => f.followerId)
      
      personas = await db.persona.findMany({
        where: {
          userId: { in: followerIds },
          id: { notIn: currentUserPersonaIds },
          isOnline: true,
        },
        include: {
          user: {
            select: { username: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      })
    } else {
      // 'new' - Get all online personas sorted by newest
      personas = await db.persona.findMany({
        where: {
          id: { notIn: currentUserPersonaIds },
          isOnline: true,
        },
        include: {
          user: {
            select: { username: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    }
    
    // Transform data for frontend
    const result = personas.map(p => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      bio: p.bio,
      username: p.user.username,
      isOnline: p.isOnline,
    }))
    
    return NextResponse.json({ 
      success: true,
      personas: result 
    })
    
  } catch (error) {
    console.error('Discovery error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
