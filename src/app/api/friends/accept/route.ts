import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// POST - Accept a friend request
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const { requestId } = await request.json()
    
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }
    
    // Find the friend request
    const friendRequest = await db.friendRequest.findFirst({
      where: {
        id: requestId,
        receiverId: user.id,
        status: 'pending'
      }
    })
    
    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }
    
    // Update request status
    await db.friendRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    })
    
    // Create friendships for both users
    await db.friendship.createMany({
      data: [
        { userId: user.id, friendId: friendRequest.senderId },
        { userId: friendRequest.senderId, friendId: user.id }
      ],
      skipDuplicates: true
    })
    
    return NextResponse.json({ success: true, message: 'Friend request accepted' })
    
  } catch (error) {
    console.error('Accept friend request error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
