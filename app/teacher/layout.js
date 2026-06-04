import AppNav from '@/components/AppNav'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const LINKS = [
  { href: '/teacher/dashboard', label: 'My Exams' },
  { href: '/teacher/exam/new', label: 'New Exam' },
]

export default async function TeacherLayout({ children }) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav links={LINKS} name={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
