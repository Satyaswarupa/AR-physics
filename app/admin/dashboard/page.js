import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Batch from '@/models/Batch'
import Exam from '@/models/Exam'
import Link from 'next/link'

export default async function AdminDashboard() {
  await connectDB()

  const [teacherCount, studentCount, batchCount, examCount] = await Promise.all([
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'student' }),
    Batch.countDocuments(),
    Exam.countDocuments(),
  ])

  const stats = [
    { label: 'Teachers', value: teacherCount, href: '/admin/users', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { label: 'Students', value: studentCount, href: '/admin/users', color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'Batches', value: batchCount, href: '/admin/batches', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    { label: 'Exams', value: examCount, href: '#', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`rounded-xl border p-5 hover:shadow-md transition-shadow ${s.color}`}>
            <div className="text-3xl font-black">{s.value}</div>
            <div className="text-sm font-medium mt-1 opacity-80">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/admin/batches" className="rounded-xl bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Manage Batches</h2>
          <p className="text-gray-500 text-sm">Create and view class batches</p>
        </Link>
        <Link href="/admin/users" className="rounded-xl bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Manage Users</h2>
          <p className="text-gray-500 text-sm">Create teachers and students, assign batches</p>
        </Link>
      </div>
    </div>
  )
}
