import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updatePersonaSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters')
    .optional(),
  avatarUrl: z.string().optional().nullable(),
  bio: z.string()
    .max(500, 'Bio must be at most 500 characters')
    .optional()
    .nullable(),
})

// GET - Fetch a single persona
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    
    const persona = await db.persona.findFirst({
      where: { 
        id,
        userId: user.id 
      },
    })
    
    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      persona 
    })
    
  } catch (error) {
    console.error('Fetch persona error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// PUT - Update a persona
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    const body = await request.json()
    
    // Validate input
    const result = updatePersonaSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    
    // Check if persona belongs to user
    const existingPersona = await db.persona.findFirst({
      where: { 
        id,
        userId: user.id 
      },
    })
    
    if (!existingPersona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }
    
    // Update persona
    const persona = await db.persona.update({
      where: { id },
      data: result.data,
    })
    
    return NextResponse.json({ 
      success: true,
      persona 
    })
    
  } catch (error) {
    console.error('Update persona error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a persona
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    
    // Check if persona belongs to user
    const existingPersona = await db.persona.findFirst({
      where: { 
        id,
        userId: user.id 
      },
    })
    
    if (!existingPersona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }
    
    // If this was the active persona, we need to activate another one
    if (existingPersona.isActive) {
      // Find another persona to make active
      const anotherPersona = await db.persona.findFirst({
        where: { 
          userId: user.id,
          id: { not: id }
        },
      })
      
      if (anotherPersona) {
        await db.persona.update({
          where: { id: anotherPersona.id },
          data: { isActive: true, isOnline: true },
        })
      }
    }
    
    // Delete persona
    await db.persona.delete({
      where: { id },
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Persona deleted' 
    })
    
  } catch (error) {
    console.error('Delete persona error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
