'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-blue-300 hover:text-white border border-blue-700 hover:border-blue-400 rounded-lg px-3 py-1.5 transition-colors"
    >
      Sign out
    </button>
  )
}
