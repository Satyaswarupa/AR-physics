import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Submission from '@/models/Submission'
import Exam from '@/models/Exam'
import { scoreExam, examEndsAt } from '@/lib/scoring'

const GRACE_MS = 10_000 // 10-second grace period

export async function POST(_req, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'student') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await connectDB()

  const submission = await Submission.findOne({ _id: id, studentId: session.userId })
  if (!submission) return Response.json({ error: 'Not found' }, { status: 404 })
  if (submission.submittedAt) return Response.json({ error: 'Already submitted' }, { status: 400 })

  const exam = await Exam.findById(submission.examId)
  if (!exam) return Response.json({ error: 'Exam not found' }, { status: 500 })

  const now = Date.now()
  const deadline = examEndsAt(submission.startedAt, exam.durationMinutes, exam.endTime)

  // Accept if within grace window; mark autoSubmitted if very late
  const isAutoSubmit = now > deadline + GRACE_MS

  const score = scoreExam(exam.questions, submission.answers)

  submission.score = score
  submission.submittedAt = new Date(now)
  submission.autoSubmitted = isAutoSubmit
  await submission.save()

  return Response.json({
    score,
    totalMarks: exam.totalMarks,
    submittedAt: submission.submittedAt,
    autoSubmitted: isAutoSubmit,
  })
}
