import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createPersonaSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters'),
  avatarUrl: z.string().optional().nullable(),
  bio: z.string()
    .max(500, 'Bio must be at most 500 characters')
    .optional()
    .nullable(),
})

// GET - Fetch all personas for current user
export async function GET() {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const personas = await db.persona.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({ 
      success: true,
      personas 
    })
    
  } catch (error) {
    console.error('Fetch personas error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST - Create a new persona
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
    
    // Validate input
    const result = createPersonaSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    
    const { name, avatarUrl, bio } = result.data
    
    // Check if user already has an active persona (if this is their first)
    const existingPersonas = await db.persona.count({
      where: { userId: user.id }
    })
    
    // If this is the first persona, make it active by default
    const isActive = existingPersonas === 0
    
    // Create persona
    const persona = await db.persona.create({
      data: {
        userId: user.id,
        name,
        avatarUrl: avatarUrl || null,
        bio: bio || null,
        isActive,
        isOnline: isActive, // If active, also set online
      }
    })
    
    return NextResponse.json({ 
      success: true,
      persona 
    })
    
  } catch (error) {
    console.error('Create persona error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
