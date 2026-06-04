import { connectDB } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Submission from '@/models/Submission'
import Exam from '@/models/Exam'
import Link from 'next/link'

export default async function ResultPage({ params }) {
  const session = await getSession()
  if (!session || session.role !== 'student') redirect('/login')

  const { id } = await params
  await connectDB()

  const submission = await Submission.findOne({ _id: id, studentId: session.userId })
  if (!submission || !submission.submittedAt) redirect('/student/dashboard')

  const exam = await Exam.findById(submission.examId)
  if (!exam) redirect('/student/dashboard')

  const percent = exam.totalMarks > 0 ? Math.round((submission.score / exam.totalMarks) * 100) : 0

  const gradeColor =
    percent >= 75 ? 'text-green-700' :
    percent >= 50 ? 'text-yellow-700' : 'text-red-700'

  const gradeBg =
    percent >= 75 ? 'bg-green-50 border-green-200' :
    percent >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  return (
    <div className="max-w-3xl mx-auto">
      {/* Score summary */}
      <div className={`rounded-2xl border p-8 mb-6 text-center ${gradeBg}`}>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{exam.title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Submitted {new Date(submission.submittedAt).toLocaleString()}
          {submission.autoSubmitted && ' (auto-submitted)'}
        </p>
        <div className={`text-6xl font-black mb-2 ${gradeColor}`}>{percent}%</div>
        <div className="text-lg text-gray-700">
          <span className="font-bold">{submission.score}</span> / {exam.totalMarks} marks
        </div>
      </div>

      {/* Per-question review */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Question Review</h2>

      <div className="space-y-4 mb-8">
        {exam.questions.map((q, qi) => {
          const chosen = submission.answers[qi] ?? -1
          const correct = q.correctOption
          const isRight = chosen === correct

          return (
            <div key={qi} className={`rounded-xl border p-5 ${isRight ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start gap-3 mb-3">
                <span className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isRight ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {isRight ? '✓' : '✗'}
                </span>
                <p className="font-medium text-gray-900">{q.text}</p>
              </div>

              <div className="space-y-1.5 pl-9">
                {q.options.map((opt, oi) => {
                  const isChosen = chosen === oi
                  const isCorrect = correct === oi
                  return (
                    <div
                      key={oi}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        isCorrect
                          ? 'bg-green-200 text-green-900 font-semibold'
                          : isChosen && !isCorrect
                          ? 'bg-red-200 text-red-900 line-through'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <span className="font-bold text-xs text-gray-500">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                      {isCorrect && <span className="ml-auto text-xs">Correct</span>}
                      {isChosen && !isCorrect && <span className="ml-auto text-xs text-red-600">Your answer</span>}
                    </div>
                  )
                })}
              </div>

              <div className="pl-9 mt-2 text-xs text-gray-500">
                {isRight ? `+${q.marks} mark${q.marks > 1 ? 's' : ''}` : '0 marks'}
                {chosen === -1 && ' (unanswered)'}
              </div>
            </div>
          )
        })}
      </div>

      <Link
        href="/student/dashboard"
        className="rounded-lg bg-blue-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-800 transition-colors"
      >
        ← Back to Dashboard
      </Link>
    </div>
  )
}
