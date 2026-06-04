import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Batch from '@/models/Batch'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  const batches = await Batch.find().sort({ createdAt: -1 })
  return Response.json({ batches })
}

export async function POST(request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, subject, year } = await request.json()
  if (!name || !year) {
    return Response.json({ error: 'name and year are required' }, { status: 400 })
  }

  await connectDB()
  const batch = await Batch.create({ name, subject, year: Number(year) })
  return Response.json({ batch }, { status: 201 })
}
