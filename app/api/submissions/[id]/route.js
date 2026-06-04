import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Submission from '@/models/Submission'
import Exam from '@/models/Exam'
import Batch from '@/models/Batch'

export async function GET(_req, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'student') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await connectDB()

  const submission = await Submission.findOne({ _id: id, studentId: session.userId })
  if (!submission) return Response.json({ error: 'Not found' }, { status: 404 })
  if (!submission.submittedAt) return Response.json({ error: 'Not yet submitted' }, { status: 400 })

  // Include full exam with correctOptions for result review
  const exam = await Exam.findById(submission.examId).populate('batchId', 'name')
  if (!exam) return Response.json({ error: 'Exam not found' }, { status: 500 })

  return Response.json({ submission, exam })
}
