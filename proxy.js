import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Inline JWT verify — proxy should not rely on shared modules per Next.js 16 guidance
const secret = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    return payload
  } catch {
    return null
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value
  const session = token ? await verifyToken(token) : null

  // Redirect logged-in users away from login
  if (pathname === '/login') {
    if (session) {
      const dest = `/${session.role}/dashboard`
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return NextResponse.next()
  }

  // Role-gated sections
  const roleForPath =
    pathname.startsWith('/student') ? 'student' :
    pathname.startsWith('/teacher') ? 'teacher' :
    pathname.startsWith('/admin')   ? 'admin'   : null

  if (roleForPath) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (session.role !== roleForPath) {
      // Redirect to their own dashboard instead of a 403
      return NextResponse.redirect(new URL(`/${session.role}/dashboard`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.svg$|.*\\.png$).*)'],
}
