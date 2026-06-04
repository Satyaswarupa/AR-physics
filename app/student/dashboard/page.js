'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import Link from 'next/link'

// Re-evaluates every `ms` milliseconds so time-based UI updates automatically
function useNow(ms = 5000) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

// Countdown display for upcoming exams
function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetMs - Date.now()))
  useEffect(() => {
    if (remaining === 0) return
    const t = setInterval(() => setRemaining(Math.max(0, targetMs - Date.now())), 1000)
    return () => clearInterval(t)
  }, [targetMs, remaining])
  const totalSec = Math.floor(remaining / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n) => String(n).padStart(2, '0')
  return {
    remaining,
    label: h > 0 ? `${h}h ${pad(m)}m ${pad(s)}s` : `${m}m ${pad(s)}s`,
  }
}

// Classify exam based on a provided `now` timestamp so it updates reactively
function classifyExam(exam, now) {
  const start = new Date(exam.startTime).getTime()
  const end   = new Date(exam.endTime).getTime()
  if (now < start)  return 'upcoming'
  if (now <= end)   return 'live'
  return 'past'
}

// Countdown shown in the upcoming card; calls onStart when it reaches 0
function UpcomingCountdown({ startTime, onStart }) {
  const { remaining, label } = useCountdown(new Date(startTime).getTime())

  // Notify parent so it can re-fetch / re-classify
  const notified = useRef(false)
  useEffect(() => {
    if (remaining === 0 && !notified.current) {
      notified.current = true
      onStart?.()
    }
  }, [remaining, onStart])

  if (remaining === 0) return <span className="text-green-600 font-semibold text-xs">Starting now!</span>
  return <span className="font-mono text-xs text-blue-600">Starts in {label}</span>
}

// ── Exam card ────────────────────────────────────────────────────────────────
function ExamCard({ exam, now, onCountdownEnd }) {
  const status   = classifyExam(exam, now)
  const submitted = !!exam.submission?.submittedAt

  const badge = {
    upcoming: 'bg-blue-100 text-blue-700',
    live:     'bg-green-100 text-green-800',
    past:     'bg-gray-100 text-gray-500',
  }[status]

  const label = {
    upcoming: 'Upcoming',
    live:     '● Live',
    past:     'Ended',
  }[status]

  return (
    <div className={`bg-white rounded-xl border px-5 py-4 transition-shadow ${
      status === 'live' && !submitted ? 'border-green-300 shadow-sm' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{exam.title}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>{label}</span>
            {submitted && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Submitted</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {exam.subject} · {exam.durationMinutes} min · {exam.questions?.length} questions
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {new Date(exam.startTime).toLocaleString()} – {new Date(exam.endTime).toLocaleString()}
          </div>
          {status === 'upcoming' && (
            <div className="mt-1.5">
              <UpcomingCountdown startTime={exam.startTime} onStart={onCountdownEnd} />
            </div>
          )}
          {submitted && (
            <div className="text-sm text-purple-700 mt-1 font-medium">
              Score: {exam.submission.score} / {exam.totalMarks}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {submitted ? (
            <Link href={`/student/result/${exam.submission.id}`}
              className="text-sm text-blue-700 font-medium hover:underline">
              View Result →
            </Link>
          ) : status === 'live' ? (
            <Link href={`/student/exam/${exam._id}`}
              className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-bold hover:bg-green-700 transition-colors shadow">
              Start Exam →
            </Link>
          ) : status === 'upcoming' ? (
            <span className="text-sm text-gray-400">Not open yet</span>
          ) : (
            <span className="text-sm text-gray-400">Missed</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const now = useNow(5000) // re-evaluate exam status every 5 s

  const [exams,     setExams]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [connected, setConnected] = useState(false)
  const [alert,     setAlert]     = useState(null)
  const socketRef = useRef(null)

  const fetchExams = useCallback(async () => {
    try {
      const res = await fetch('/api/student/exams')
      if (!res.ok) { setError('Failed to load exams'); return }
      const data = await res.json()
      setExams(data.exams || [])
      setError('')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchExams() }, [fetchExams])

  // Socket.io
  useEffect(() => {
    let socket

    async function connect() {
      const res  = await fetch('/api/auth/me')
      const data = await res.json()
      const batchId = data.user?.batchId
      if (!batchId) return

      socket = io({ transports: ['websocket', 'polling'] })
      socketRef.current = socket

      socket.on('connect', () => {
        setConnected(true)
        socket.emit('join:batch', batchId)
      })

      socket.on('disconnect', () => setConnected(false))

      // Teacher just created an exam for this batch → show it immediately
      socket.on('exam:created', () => {
        fetchExams()
      })

      // Server pushes this when an exam window opens
      socket.on('exam:live', (data) => {
        setAlert(data)
        fetchExams()
      })
    }

    connect()
    return () => socket?.disconnect()
  }, [fetchExams])

  // Classify using reactive `now` so transitions happen without a re-fetch
  const live     = exams.filter((e) => classifyExam(e, now) === 'live')
  const upcoming = exams.filter((e) => classifyExam(e, now) === 'upcoming')
  const past     = exams.filter((e) => classifyExam(e, now) === 'past')

  if (loading) return <div className="text-gray-500 text-sm">Loading your exams…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-gray-400">{connected ? 'Live' : 'Connecting…'}</span>
        </div>
      </div>

      {/* Socket push alert */}
      {alert && (
        <div className="mb-5 rounded-xl bg-green-50 border border-green-300 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-800 font-medium text-sm">
            <span>🟢</span>
            <span><strong>{alert.title}</strong> ({alert.subject}) just went live — start now!</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-green-600 hover:text-green-800 text-xl leading-none ml-4">×</button>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {exams.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No exams scheduled for your batch yet.</p>
          <p className="text-gray-400 text-sm mt-1">You will be notified the moment one goes live.</p>
        </div>
      )}

      {live.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3">Live Now</h2>
          <div className="space-y-3">
            {live.map((e) => (
              <ExamCard key={e._id} exam={e} now={now} onCountdownEnd={fetchExams} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((e) => (
              <ExamCard key={e._id} exam={e} now={now} onCountdownEnd={fetchExams} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Past</h2>
          <div className="space-y-3">
            {past.map((e) => (
              <ExamCard key={e._id} exam={e} now={now} onCountdownEnd={fetchExams} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
