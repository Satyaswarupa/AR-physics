'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [batches, setBatches] = useState([])
  const [batchError, setBatchError] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', batchId: '', rollNumber: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const loadBatches = useCallback(async () => {
    setBatchError('')
    try {
      const res = await fetch('/api/batches')
      const data = await res.json()
      if (!res.ok) {
        setBatchError(data.error || 'Failed to load batches')
        return
      }
      setBatches(data.batches || [])
    } catch {
      setBatchError('Network error loading batches')
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (res.ok) setUsers(data.users || [])
    } catch {
      // non-critical for form rendering
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadBatches(), loadUsers()])
    setLoading(false)
  }, [loadBatches, loadUsers])

  useEffect(() => { load() }, [load])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error); return }
      setFormSuccess(`${form.role === 'teacher' ? 'Teacher' : 'Student'} created successfully!`)
      setForm({ name: '', email: '', password: '', role: 'student', batchId: '', rollNumber: '' })
      load()
    } catch {
      setFormError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const teachers = users.filter((u) => u.role === 'teacher')
  const students = users.filter((u) => u.role === 'student')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create User</h2>
          {formError && <p className="mb-3 text-red-600 text-sm">{formError}</p>}
          {formSuccess && <p className="mb-3 text-green-600 text-sm">{formSuccess}</p>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value, batchId: '' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {form.role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch * {batches.length > 0 && <span className="text-gray-400 font-normal">({batches.length} available)</span>}
                  </label>

                  {batchError ? (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                      {batchError} —{' '}
                      <button type="button" onClick={loadBatches} className="underline">retry</button>
                    </div>
                  ) : batches.length === 0 ? (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
                      No batches found.{' '}
                      <Link href="/admin/batches" className="underline font-medium">Create a batch first →</Link>
                    </div>
                  ) : (
                    <select
                      required
                      value={form.batchId}
                      onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— Select a batch —</option>
                      {batches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name} ({b.year})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input
                    value={form.rollNumber}
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting || (form.role === 'student' && batches.length === 0)}
              className="w-full rounded-lg bg-blue-900 text-white py-2 text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create User'}
            </button>
          </form>
        </div>

        {/* User lists */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Teachers ({teachers.length})</h2>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : teachers.length === 0 ? (
              <p className="text-gray-500 text-sm">No teachers yet.</p>
            ) : (
              <div className="space-y-2">
                {teachers.map((u) => (
                  <div key={u._id} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Students ({students.length})</h2>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : students.length === 0 ? (
              <p className="text-gray-500 text-sm">No students yet.</p>
            ) : (
              <div className="space-y-2">
                {students.map((u) => (
                  <div key={u._id} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                    {u.rollNumber && <div className="text-xs text-gray-400">Roll: {u.rollNumber}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
