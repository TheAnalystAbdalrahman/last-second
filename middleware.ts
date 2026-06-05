import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/dashboard')) {
    return supabaseResponse
  }

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      response.cookies.set(name, value)
    })
    return response
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const redirect = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      response.cookies.set(name, value)
    })
    return response
  }

  if (profileError || !profile) {
    return redirect('/sign-in')
  }

  const role = profile.role

  if (
    pathname.startsWith('/dashboard/client') &&
    role !== 'client' &&
    role !== 'both' &&
    role !== 'admin'
  ) {
    return redirect('/sign-in')
  }

  if (
    pathname.startsWith('/dashboard/provider') &&
    role !== 'provider' &&
    role !== 'both' &&
    role !== 'admin'
  ) {
    return redirect('/sign-in')
  }

  if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
    return redirect('/sign-in')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
