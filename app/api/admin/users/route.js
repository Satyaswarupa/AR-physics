import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  const users = await User.find({ role: { $ne: 'admin' } }, '-password').sort({ createdAt: -1 })
  return Response.json({ users })
}

export async function POST(request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, email, password, role, batchId, rollNumber } = await request.json()

  if (!name || !email || !password || !role) {
    return Response.json({ error: 'name, email, password, and role are required' }, { status: 400 })
  }
  if (!['teacher', 'student'].includes(role)) {
    return Response.json({ error: 'role must be teacher or student' }, { status: 400 })
  }
  if (role === 'student' && !batchId) {
    return Response.json({ error: 'batchId is required for students' }, { status: 400 })
  }

  await connectDB()

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return Response.json({ error: 'Email already in use' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role,
    batchId: role === 'student' ? batchId : undefined,
    rollNumber: role === 'student' ? rollNumber : undefined,
  })

  return Response.json(
    { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    { status: 201 }
  )
}
