import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Exam from '@/models/Exam'
import Submission from '@/models/Submission'
import Batch from '@/models/Batch'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'student') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const exams = await Exam.find({ batchId: session.batchId })
    .select('-questions.correctOption') // never send correct answers to students
    .populate('batchId', 'name')
    .sort({ startTime: -1 })

  // Attach the student's submission status for each exam
  const examIds = exams.map((e) => e._id)
  const submissions = await Submission.find({ examId: { $in: examIds }, studentId: session.userId }, 'examId submittedAt score')

  const subMap = {}
  for (const s of submissions) subMap[s.examId.toString()] = s

  const enriched = exams.map((e) => {
    const sub = subMap[e._id.toString()]
    return {
      ...e.toObject(),
      submission: sub ? { id: sub._id, submittedAt: sub.submittedAt, score: sub.score } : null,
    }
  })

  return Response.json({ exams: enriched })
}
