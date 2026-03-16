import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { db } from './db'
import bcrypt from 'bcryptjs'

const SECRET_KEY = process.env.JWT_SECRET || 'persona-secret-key-change-in-production'
const key = new TextEncoder().encode(SECRET_KEY)

export interface SessionUser {
  id: string
  email: string
  username: string
  avatarUrl: string | null
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Create session token
export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Session expires in 7 days
    .sign(key)
  
  return token
}

// Verify session token
export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload.user as SessionUser
  } catch {
    return null
  }
}

// Get current session from cookies
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  
  if (!token) return null
  
  return verifySession(token)
}

// Set session cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const user = await db.user.findUnique({
    where: { email }
  })
  
  if (!user) return null
  
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null
  
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
  }
}

// Check if username exists
export async function usernameExists(username: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { username }
  })
  return !!user
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { email }
  })
  return !!user
}

// Create new user
export async function createUser(email: string, username: string, password: string): Promise<SessionUser> {
  const hashedPassword = await hashPassword(password)
  
  const user = await db.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    }
  })
  
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
  }
}
