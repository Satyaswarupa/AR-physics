import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Exam from '@/models/Exam'
import Submission from '@/models/Submission'
import User from '@/models/User'
import Batch from '@/models/Batch'
import Link from 'next/link'

export default async function ResultsPage({ params }) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') redirect('/login')

  const { id } = await params
  await connectDB()

  const exam = await Exam.findOne({ _id: id, createdBy: session.userId }).populate('batchId', 'name year')
  if (!exam) redirect('/teacher/dashboard')

  const submissions = await Submission.find({ examId: id })
    .populate('studentId', 'name email rollNumber')
    .sort({ score: -1 })

  const submitted = submissions.filter((s) => s.submittedAt)
  const pending = submissions.filter((s) => !s.submittedAt)

  const avg = submitted.length > 0
    ? (submitted.reduce((sum, s) => sum + s.score, 0) / submitted.length).toFixed(1)
    : '—'

  const topScore = submitted.length > 0 ? Math.max(...submitted.map((s) => s.score)) : 0

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/teacher/dashboard" className="text-sm text-blue-700 hover:underline">← My Exams</Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{exam.title} — Results</h1>
      <p className="text-gray-500 text-sm mb-6">
        {exam.subject} · {exam.batchId?.name} · {exam.questions.length} questions · {exam.totalMarks} marks total
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Submitted', value: submitted.length },
          { label: 'In Progress', value: pending.length },
          { label: 'Average Score', value: avg },
          { label: 'Top Score', value: topScore || '—' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-black text-blue-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Results table */}
      {submitted.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-12 text-center text-gray-500">
          No submissions yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rank</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Roll</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">%</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submitted.map((s, idx) => {
                const pct = exam.totalMarks > 0 ? Math.round((s.score / exam.totalMarks) * 100) : 0
                const pctColor = pct >= 75 ? 'text-green-700' : pct >= 50 ? 'text-yellow-700' : 'text-red-600'
                return (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-400">#{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{s.studentId?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-400">{s.studentId?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.studentId?.rollNumber || '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {s.score}<span className="text-gray-400 font-normal">/{exam.totalMarks}</span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${pctColor}`}>{pct}%</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(s.submittedAt).toLocaleString()}
                      {s.autoSubmitted && <span className="ml-1 text-orange-500">(auto)</span>}
                    </td>
                    <td className="px-4 py-3">
                      {/* Per-answer breakdown visible to teacher */}
                      <details className="cursor-pointer">
                        <summary className="text-xs text-blue-700 hover:underline select-none">Answers</summary>
                        <div className="mt-2 text-xs space-y-0.5">
                          {exam.questions.map((q, qi) => {
                            const chosen = s.answers[qi] ?? -1
                            const correct = q.correctOption
                            const ok = chosen === correct
                            return (
                              <div key={qi} className={ok ? 'text-green-700' : 'text-red-600'}>
                                Q{qi + 1}: {chosen === -1 ? 'skipped' : `${String.fromCharCode(65 + chosen)} ${ok ? '✓' : `✗ (correct: ${String.fromCharCode(65 + correct)})`}`}
                              </div>
                            )
                          })}
                        </div>
                      </details>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">In Progress / Not Yet Started ({pending.length})</h3>
          <div className="space-y-2">
            {pending.map((s) => (
              <div key={s._id} className="bg-white rounded-lg border border-gray-200 px-4 py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{s.studentId?.name}</span>
                  <span className="text-sm text-gray-400 ml-2">{s.studentId?.email}</span>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">In progress</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
