import { connectDB } from '@/lib/db'
import { createSession } from '@/lib/auth'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await createSession(user)

    return Response.json({
      user: { id: user._id, name: user.name, role: user.role, email: user.email },
    })
  } catch (err) {
    console.error('[login]', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
