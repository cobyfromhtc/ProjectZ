import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Get storyline details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const { id } = await params
    
    const storyline = await db.storyline.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true, avatarUrl: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, avatarUrl: true }
            }
          }
        },
        channels: {
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { members: true }
        }
      }
    })
    
    if (!storyline) {
      return NextResponse.json({ error: 'Storyline not found' }, { status: 404 })
    }
    
    // Check if user is member
    const membership = await db.storylineMember.findFirst({
      where: { storylineId: id, userId: user.id }
    })
    
    return NextResponse.json({ 
      success: true, 
      storyline: {
        ...storyline,
        memberCount: storyline._count.members,
        isMember: !!membership,
        role: membership?.role || null
      }
    })
    
  } catch (error) {
    console.error('Get storyline error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// PUT - Update storyline
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    const { name, description, iconUrl, bannerUrl, category, isPublic } = body
    
    // Check if user is owner or admin
    const membership = await db.storylineMember.findFirst({
      where: { storylineId: id, userId: user.id, role: { in: ['owner', 'admin'] } }
    })
    
    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    
    const updated = await db.storyline.update({
      where: { id },
      data: {
        name: name?.trim(),
        description: description?.trim() || null,
        iconUrl: iconUrl || null,
        bannerUrl: bannerUrl || null,
        category,
        isPublic
      }
    })
    
    return NextResponse.json({ success: true, storyline: updated })
    
  } catch (error) {
    console.error('Update storyline error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE - Delete storyline
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Check if user is owner
    const membership = await db.storylineMember.findFirst({
      where: { storylineId: id, userId: user.id, role: 'owner' }
    })
    
    if (!membership) {
      return NextResponse.json({ error: 'Only owner can delete storyline' }, { status: 403 })
    }
    
    await db.storyline.delete({ where: { id } })
    
    return NextResponse.json({ success: true, message: 'Storyline deleted' })
    
  } catch (error) {
    console.error('Delete storyline error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
