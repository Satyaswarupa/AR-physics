import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Exam from '@/models/Exam'
import Submission from '@/models/Submission'
import User from '@/models/User' // register schema for populate('studentId')

export async function GET(_req, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await connectDB()

  const exam = await Exam.findOne({ _id: id, createdBy: session.userId })
  if (!exam) return Response.json({ error: 'Not found' }, { status: 404 })

  const submissions = await Submission.find({ examId: id })
    .populate('studentId', 'name email rollNumber')
    .sort({ score: -1 })

  return Response.json({ exam, submissions })
}
