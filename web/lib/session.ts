export interface SessionUser {
  _id: string
  name: string
  email: string
  role: string
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null

  try {
    const value = localStorage.getItem('apax_user')
    return value ? JSON.parse(value) as SessionUser : null
  } catch {
    return null
  }
}
