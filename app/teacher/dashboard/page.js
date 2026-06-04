import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Exam from '@/models/Exam'
import Batch from '@/models/Batch'
import Link from 'next/link'

function statusBadge(exam) {
  const now = Date.now()
  const start = new Date(exam.startTime).getTime()
  const end = new Date(exam.endTime).getTime()
  if (now < start) return { label: 'Upcoming', cls: 'bg-blue-100 text-blue-700' }
  if (now <= end) return { label: 'Live', cls: 'bg-green-100 text-green-700' }
  return { label: 'Ended', cls: 'bg-gray-100 text-gray-600' }
}

export default async function TeacherDashboard() {
  const session = await getSession()
  await connectDB()

  const exams = await Exam.find({ createdBy: session.userId })
    .populate('batchId', 'name year')
    .sort({ startTime: -1 })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
        <Link
          href="/teacher/exam/new"
          className="rounded-lg bg-blue-900 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          + New Exam
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No exams yet.</p>
          <Link href="/teacher/exam/new" className="text-blue-700 font-medium hover:underline">Create your first exam →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const badge = statusBadge(exam)
            return (
              <div key={exam._id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{exam.title}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {exam.subject} · {exam.batchId?.name} · {exam.questions.length} questions · {exam.durationMinutes} min
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(exam.startTime).toLocaleString()} – {new Date(exam.endTime).toLocaleString()}
                  </div>
                </div>
                <Link
                  href={`/teacher/exam/${exam._id}/results`}
                  className="text-sm text-blue-700 font-medium hover:underline"
                >
                  Results →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
