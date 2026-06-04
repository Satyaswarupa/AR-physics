import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Submission from '@/models/Submission'

export async function PATCH(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'student') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { answers } = await request.json()

  if (!Array.isArray(answers)) {
    return Response.json({ error: 'answers must be an array' }, { status: 400 })
  }

  await connectDB()

  const submission = await Submission.findOne({ _id: id, studentId: session.userId })
  if (!submission) return Response.json({ error: 'Not found' }, { status: 404 })
  if (submission.submittedAt) return Response.json({ error: 'Already submitted' }, { status: 400 })

  submission.answers = answers
  submission.lastSavedAt = new Date()
  await submission.save()

  return Response.json({ ok: true, lastSavedAt: submission.lastSavedAt })
}
