import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Exam from '@/models/Exam'
import Submission from '@/models/Submission'
import { examEndsAt } from '@/lib/scoring'

export async function POST(_req, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'student') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await connectDB()

  const exam = await Exam.findById(id)
  if (!exam) return Response.json({ error: 'Exam not found' }, { status: 404 })

  // Verify this exam belongs to the student's batch
  if (exam.batchId.toString() !== session.batchId) {
    return Response.json({ error: 'This exam is not for your batch' }, { status: 403 })
  }

  const now = Date.now()
  // Allow 15 s early to absorb client/server clock skew (the student's browser
  // may flip the button to "Start" a few seconds before the server clock agrees)
  const CLOCK_TOLERANCE_MS = 15_000

  if (now < exam.startTime.getTime() - CLOCK_TOLERANCE_MS) {
    return Response.json({ error: 'Exam has not started yet' }, { status: 400 })
  }
  if (now > exam.endTime.getTime()) {
    return Response.json({ error: 'Exam window has closed' }, { status: 400 })
  }

  // Check for an existing submission
  let submission = await Submission.findOne({ examId: id, studentId: session.userId })

  if (submission) {
    if (submission.submittedAt) {
      return Response.json({ error: 'You have already submitted this exam' }, { status: 400 })
    }
    // Resume: return saved state
    const deadline = examEndsAt(submission.startedAt, exam.durationMinutes, exam.endTime)
    const questions = exam.questions.map(({ _id, text, options, marks }) => ({ _id, text, options, marks }))
    return Response.json({
      submissionId: submission._id,
      questions,
      examEndsAt: deadline,
      answers: submission.answers,
      serverNow: Date.now(),
    })
  }

  // Create new submission
  const startedAt = new Date(now)
  submission = await Submission.create({
    examId: id,
    studentId: session.userId,
    answers: new Array(exam.questions.length).fill(-1),
    startedAt,
  })

  const deadline = examEndsAt(startedAt, exam.durationMinutes, exam.endTime)
  // Strip correctOption before sending to client
  const questions = exam.questions.map(({ _id, text, options, marks }) => ({ _id, text, options, marks }))

  return Response.json({
    submissionId: submission._id,
    questions,
    examEndsAt: deadline,
    answers: submission.answers,
    serverNow: Date.now(),
  })
}
