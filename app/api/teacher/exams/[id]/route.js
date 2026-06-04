import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Exam from '@/models/Exam'
import Batch from '@/models/Batch'

export async function GET(_req, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await connectDB()
  const exam = await Exam.findOne({ _id: id, createdBy: session.userId }).populate('batchId', 'name year')
  if (!exam) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ exam })
}

export async function DELETE(_req, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await connectDB()
  const exam = await Exam.findOneAndDelete({ _id: id, createdBy: session.userId })
  if (!exam) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ ok: true })
}
