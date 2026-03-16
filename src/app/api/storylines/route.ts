import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { STORYLINE_CATEGORIES } from '@/lib/constants'

// GET - Browse public storylines
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    // Build where clause
    const where: Record<string, unknown> = { isPublic: true }
    
    if (category && STORYLINE_CATEGORIES.includes(category as typeof STORYLINE_CATEGORIES[number])) {
      where.category = category
    }
    
    // Get all storylines and filter by search in memory for SQLite
    let storylines = await db.storyline.findMany({
      where,
      include: {
        owner: {
          select: { id: true, username: true, avatarUrl: true }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    
    // Filter by search query if provided
    if (search && search.length >= 2) {
      const searchLower = search.toLowerCase()
      storylines = storylines.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        (s.description && s.description.toLowerCase().includes(searchLower))
      )
    }
    
    // Check which ones the user has joined
    const joinedIds = await db.storylineMember.findMany({
      where: { userId: user.id },
      select: { storylineId: true }
    })
    const joinedSet = new Set(joinedIds.map(j => j.storylineId))
    
    const result = storylines.map(s => ({
      ...s,
      memberCount: s._count.members,
      isJoined: joinedSet.has(s.id)
    }))
    
    return NextResponse.json({ 
      success: true, 
      storylines: result,
      categories: STORYLINE_CATEGORIES
    })
    
  } catch (error) {
    console.error('Browse storylines error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST - Create a new storyline
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const body = await request.json()
    const { name, description, iconUrl, bannerUrl, category, isPublic } = body
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    if (!category || !STORYLINE_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Valid category is required' }, { status: 400 })
    }
    
    // Create storyline
    const storyline = await db.storyline.create({
      data: {
        ownerId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        iconUrl: iconUrl || null,
        bannerUrl: bannerUrl || null,
        category,
        isPublic: isPublic !== false
      }
    })
    
    // Add owner as member with owner role
    await db.storylineMember.create({
      data: {
        storylineId: storyline.id,
        userId: user.id,
        role: 'owner'
      }
    })
    
    // Create default channels
    await db.storylineChannel.createMany({
      data: [
        { storylineId: storyline.id, name: 'general', type: 'text', position: 0 },
        { storylineId: storyline.id, name: 'ooc', type: 'text', position: 1 }
      ]
    })
    
    return NextResponse.json({ 
      success: true, 
      storyline,
      message: 'Storyline created successfully' 
    })
    
  } catch (error) {
    console.error('Create storyline error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
