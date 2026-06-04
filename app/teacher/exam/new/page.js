'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const emptyQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correctOption: null, // null = not selected yet, teacher must pick
  marks: 1,
})

export default function NewExamPage() {
  const router = useRouter()
  const [batches, setBatches] = useState([])
  const [batchError, setBatchError] = useState('')
  const [form, setForm] = useState({
    title: '',
    subject: 'Physics',
    batchId: '',
    startTime: '',
    durationMinutes: 30,
    endTime: '', // auto-calculated but shown
  })
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load batches
  useEffect(() => {
    fetch('/api/batches')
      .then((r) => r.json())
      .then((d) => {
        if (d.batches) setBatches(d.batches)
        else setBatchError(d.error || 'Failed to load batches')
      })
      .catch(() => setBatchError('Network error loading batches'))
  }, [])

  // Auto-calculate end time whenever start time or duration changes
  useEffect(() => {
    if (form.startTime && form.durationMinutes) {
      const start = new Date(form.startTime)
      if (!isNaN(start.getTime())) {
        const end = new Date(start.getTime() + Number(form.durationMinutes) * 60_000)
        // Format to datetime-local string (YYYY-MM-DDTHH:mm)
        const pad = (n) => String(n).padStart(2, '0')
        const local = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`
        setForm((prev) => ({ ...prev, endTime: local }))
      }
    }
  }, [form.startTime, form.durationMinutes])

  function updateQuestion(idx, field, value) {
    setQuestions((prev) => {
      const q = [...prev]
      q[idx] = { ...q[idx], [field]: value }
      return q
    })
  }

  function updateOption(qIdx, optIdx, value) {
    setQuestions((prev) => {
      const q = [...prev]
      const opts = [...q[qIdx].options]
      opts[optIdx] = value
      q[qIdx] = { ...q[qIdx], options: opts }
      return q
    })
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()])
  }

  function removeQuestion(idx) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) { setError(`Question ${i + 1}: question text is required`); return }
      if (q.options.some((o) => !o.trim())) { setError(`Question ${i + 1}: all 4 options are required`); return }
      if (q.correctOption === null) { setError(`Question ${i + 1}: please select the correct answer`); return }
    }

    if (!form.endTime) { setError('Could not calculate end time — check start time and duration'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/teacher/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          durationMinutes: Number(form.durationMinutes),
          questions,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/teacher/dashboard')
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Exam</h1>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Exam details ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Exam Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Physics Unit Test 1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Physics</option>
                <option>Math</option>
                <option>Chemistry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch * {batches.length > 0 && <span className="text-gray-400 font-normal">({batches.length})</span>}
              </label>
              {batchError ? (
                <p className="text-red-600 text-sm">{batchError}</p>
              ) : batches.length === 0 ? (
                <p className="text-amber-600 text-sm">No batches yet — ask admin to create one.</p>
              ) : (
                <select
                  required
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Select —</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name} ({b.year})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Timing row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input
                required
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
              <input
                required
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Auto-calculated end time — read-only display */}
          {form.endTime && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
              <span className="font-medium">Exam window closes:</span>{' '}
              {new Date(form.endTime).toLocaleString()}
              <span className="text-blue-500 ml-2 text-xs">(start time + duration)</span>
            </div>
          )}
        </div>

        {/* ── Questions ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Questions ({questions.length})</h2>

          {questions.map((q, qi) => (
            <div key={qi} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700 text-sm">Question {qi + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qi)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <textarea
                required
                value={q.text}
                onChange={(e) => updateQuestion(qi, 'text', e.target.value)}
                placeholder="Question text…"
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />

              {/* Options — radio selects correct answer */}
              <p className="text-xs font-medium text-gray-500 mb-2">
                Fill each option, then <span className="text-blue-700">click the circle</span> next to the correct answer:
              </p>

              {q.correctOption === null && (
                <p className="text-xs text-amber-600 mb-2">⚠ No correct answer selected yet</p>
              )}

              <div className="space-y-2 mb-3">
                {q.options.map((opt, oi) => {
                  const isCorrect = q.correctOption === oi
                  return (
                    <div
                      key={oi}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                        isCorrect
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuestion(qi, 'correctOption', oi)}
                        title="Mark as correct answer"
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isCorrect
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {isCorrect && (
                          <span className="text-white text-xs font-bold leading-none">✓</span>
                        )}
                      </button>
                      <span className="text-xs font-bold text-gray-400 w-4">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <input
                        required
                        value={opt}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="flex-1 bg-transparent text-sm focus:outline-none text-gray-800"
                      />
                      {isCorrect && (
                        <span className="text-xs text-green-600 font-semibold flex-shrink-0">Correct</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <label className="text-sm text-gray-600">Marks:</label>
                <input
                  type="number"
                  min={1}
                  value={q.marks}
                  onChange={(e) => updateQuestion(qi, 'marks', Number(e.target.value))}
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + Add Question
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-900 text-white py-3 font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create Exam'}
        </button>
      </form>
    </div>
  )
}
