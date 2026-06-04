import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Exam from '@/models/Exam'
import Batch from '@/models/Batch'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'teacher') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  const exams = await Exam.find({ createdBy: session.userId })
    .populate('batchId', 'name year')
    .sort({ createdAt: -1 })

  return Response.json({ exams })
}

export async function POST(request) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, subject, batchId, startTime, endTime, durationMinutes, questions } = await request.json()

  if (!title || !subject || !batchId || !startTime || !endTime || !durationMinutes) {
    return Response.json({ error: 'All fields are required' }, { status: 400 })
  }
  if (!questions || questions.length === 0) {
    return Response.json({ error: 'At least one question is required' }, { status: 400 })
  }
  if (new Date(startTime) >= new Date(endTime)) {
    return Response.json({ error: 'startTime must be before endTime' }, { status: 400 })
  }

  await connectDB()

  const exam = new Exam({
    title,
    subject,
    batchId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    durationMinutes: Number(durationMinutes),
    questions,
    createdBy: session.userId,
  })
  await exam.save()

  // Push to students in this batch via Socket.io so they see it instantly
  const io = globalThis._io
  if (io) {
    io.to(`batch:${batchId}`).emit('exam:created', {
      examId:    exam._id.toString(),
      title:     exam.title,
      subject:   exam.subject,
      startTime: exam.startTime,
      endTime:   exam.endTime,
    })
  }

  return Response.json({ exam }, { status: 201 })
}
