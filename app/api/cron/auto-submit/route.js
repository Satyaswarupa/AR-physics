/*
 * Auto-submit cron endpoint.
 *
 * Vercel Cron: add to vercel.json:
 *   { "crons": [{ "path": "/api/cron/auto-submit", "schedule": "* * * * *" }] }
 * and set CRON_SECRET in environment variables.
 *
 * Local dev: run `node scripts/cron-dev.js` in a separate terminal.
 */

import { connectDB } from '@/lib/db'
import Submission from '@/models/Submission'
import Exam from '@/models/Exam'
import { scoreExam } from '@/lib/scoring'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  // Protect with CRON_SECRET so only authorised callers can trigger this
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const now = new Date()

  // Find all incomplete submissions
  const pending = await Submission.find({ submittedAt: null })

  let processed = 0

  for (const sub of pending) {
    const exam = await Exam.findById(sub.examId)
    if (!exam) continue

    // A student's personal deadline: start + duration
    const personalDeadline = new Date(sub.startedAt.getTime() + exam.durationMinutes * 60_000)
    // Effective deadline is the earlier of personal deadline and exam window end
    const deadline = personalDeadline < exam.endTime ? personalDeadline : exam.endTime

    if (now > deadline) {
      const score = scoreExam(exam.questions, sub.answers)
      sub.score = score
      sub.submittedAt = now
      sub.autoSubmitted = true
      await sub.save()
      processed++
    }
  }

  return Response.json({ ok: true, processed, checkedAt: now })
}
