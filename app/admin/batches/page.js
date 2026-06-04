'use client'

import { useState, useEffect, useCallback } from 'react'

export default function BatchesPage() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', subject: '', year: new Date().getFullYear() })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/batches')
      const data = await res.json()
      setBatches(data.batches || [])
    } catch {
      setError('Failed to load batches')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error); return }
      setForm({ name: '', subject: '', year: new Date().getFullYear() })
      load()
    } catch {
      setFormError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Batches</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Batch</h2>
          {formError && <p className="mb-4 text-red-600 text-sm">{formError}</p>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Class 12 Science Batch A"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Physics"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input
                required
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-900 text-white py-2 text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create Batch'}
            </button>
          </form>
        </div>

        {/* Batch list */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Batches</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : error ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : batches.length === 0 ? (
            <p className="text-gray-500 text-sm">No batches yet.</p>
          ) : (
            <div className="space-y-3">
              {batches.map((b) => (
                <div key={b._id} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <div className="font-semibold text-gray-900">{b.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {b.year}{b.subject ? ` · ${b.subject}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
