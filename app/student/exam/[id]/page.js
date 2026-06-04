'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Timer from '@/components/exam/Timer'

export default function ExamPage() {
  const { id } = useParams()
  const router = useRouter()

  const [state, setState] = useState('loading') // loading | ready | submitting | done | error
  const [errorMsg, setErrorMsg] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [current, setCurrent] = useState(0)
  const [submissionId, setSubmissionId] = useState(null)
  const [examEndsAt, setExamEndsAt] = useState(null)
  const [serverNow, setServerNow] = useState(null)
  const [saveStatus, setSaveStatus] = useState('') // 'saving' | 'saved' | ''
  const saveTimer = useRef(null)
  const submitted = useRef(false)

  // Start exam on mount — retry up to 5 times if server clock hasn't caught up yet
  useEffect(() => {
    let attempts = 0
    const MAX = 5

    async function startExam() {
      attempts++
      try {
        const res  = await fetch(`/api/exams/${id}/start`, { method: 'POST' })
        const data = await res.json()

        if (!res.ok) {
          // If the server says "not started yet" and we have retries left, wait 2 s and try again
          if (data.error === 'Exam has not started yet' && attempts < MAX) {
            setTimeout(startExam, 2000)
            return
          }
          setErrorMsg(data.error)
          setState('error')
          return
        }

        setQuestions(data.questions)
        setAnswers(data.answers)
        setSubmissionId(data.submissionId)
        setExamEndsAt(data.examEndsAt)
        setServerNow(data.serverNow)
        setState('ready')
      } catch {
        if (attempts < MAX) { setTimeout(startExam, 2000); return }
        setErrorMsg('Failed to start exam. Please check your connection and try again.')
        setState('error')
      }
    }

    startExam()
  }, [id])

  // Auto-save every 30 seconds
  const saveAnswers = useCallback(async (currentAnswers) => {
    if (!submissionId || submitted.current) return
    setSaveStatus('saving')
    try {
      await fetch(`/api/submissions/${submissionId}/save`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: currentAnswers }),
      })
      setSaveStatus('saved')
    } catch {
      setSaveStatus('')
    }
  }, [submissionId])

  useEffect(() => {
    if (state !== 'ready' || !submissionId) return
    saveTimer.current = setInterval(() => saveAnswers(answers), 30_000)
    return () => clearInterval(saveTimer.current)
  }, [state, submissionId, answers, saveAnswers])

  function selectAnswer(optionIdx) {
    setAnswers((prev) => {
      const updated = [...prev]
      updated[current] = optionIdx
      return updated
    })
  }

  async function handleSubmit() {
    if (submitted.current) return
    submitted.current = true
    clearInterval(saveTimer.current)
    setState('submitting')

    // Final save before submit
    await fetch(`/api/submissions/${submissionId}/save`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })

    try {
      const res = await fetch(`/api/submissions/${submissionId}/submit`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error); setState('error'); return }
      router.push(`/student/result/${submissionId}`)
    } catch {
      setErrorMsg('Submit failed. Please try again.')
      submitted.current = false
      setState('ready')
    }
  }

  const handleTimerExpire = useCallback(() => {
    if (!submitted.current) handleSubmit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId, answers])

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Starting exam…</div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="max-w-lg mx-auto mt-12 bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h2 className="font-bold text-lg mb-2">Error</h2>
        <p>{errorMsg}</p>
        <button onClick={() => router.push('/student/dashboard')} className="mt-4 text-sm text-red-600 underline">
          Back to dashboard
        </button>
      </div>
    )
  }

  const q = questions[current]
  const answeredCount = answers.filter((a) => a !== -1).length

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-gray-200 px-5 py-3">
        <div className="text-sm text-gray-600">
          Question <span className="font-bold text-gray-900">{current + 1}</span> of {questions.length}
          <span className="ml-3 text-gray-400">({answeredCount} answered)</span>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && <span className="text-xs text-gray-400">Saving…</span>}
          {saveStatus === 'saved' && <span className="text-xs text-green-600">Saved</span>}
          {examEndsAt && serverNow && (
            <Timer examEndsAt={examEndsAt} serverNow={serverNow} onExpire={handleTimerExpire} />
          )}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <p className="text-gray-900 font-medium text-base mb-6 leading-relaxed">{q.text}</p>

        <div className="space-y-3">
          {q.options.map((opt, oi) => {
            const selected = answers[current] === oi
            return (
              <button
                key={oi}
                onClick={() => selectAnswer(oi)}
                className={`w-full text-left flex items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                  selected
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800'
                }`}
              >
                <span className={`font-bold flex-shrink-0 ${selected ? 'text-blue-700' : 'text-gray-400'}`}>
                  {String.fromCharCode(65 + oi)}.
                </span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          ← Previous
        </button>

        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
            className="rounded-lg bg-blue-900 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={state === 'submitting'}
            className="rounded-lg bg-green-600 text-white px-5 py-2 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {state === 'submitting' ? 'Submitting…' : 'Submit Exam'}
          </button>
        )}
      </div>

      {/* Question navigator grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-500 mb-3">Question Navigator</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((_, qi) => {
            const answered = answers[qi] !== -1
            return (
              <button
                key={qi}
                onClick={() => setCurrent(qi)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                  qi === current
                    ? 'bg-blue-900 text-white'
                    : answered
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {qi + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit button at bottom for convenience */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={state === 'submitting'}
          className="rounded-lg bg-green-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {state === 'submitting' ? 'Submitting…' : `Submit Exam (${answeredCount}/${questions.length} answered)`}
        </button>
      </div>
    </div>
  )
}
