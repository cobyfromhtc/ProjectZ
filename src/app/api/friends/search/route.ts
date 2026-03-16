import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Search for users by username
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, users: [] })
    }
    
    // Get all users and filter in memory for SQLite case-insensitive search
    const allUsers = await db.user.findMany({
      where: {
        id: { not: user.id }
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        personas: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isOnline: true
          }
        }
      },
      take: 100
    })
    
    // Filter by username (case-insensitive)
    const users = allUsers.filter(u => 
      u.username.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)
    
    return NextResponse.json({ success: true, users })
    
  } catch (error) {
    console.error('Search users error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
