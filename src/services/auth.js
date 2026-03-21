const TOKEN_KEY = 'ft_token'
const EXPIRES_KEY = 'ft_expires'

export function saveAuth(token, expiresAt) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EXPIRES_KEY, String(expiresAt))
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function isAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY)
  const expires = parseInt(localStorage.getItem(EXPIRES_KEY), 10)
  return !!token && Date.now() < expires
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_KEY)
}

export async function login(username, password) {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (res.status === 401) {
    throw new Error('Invalid credentials')
  }

  if (!res.ok) {
    throw new Error('Login failed. Please try again.')
  }

  const { token, expiresAt } = await res.json()
  saveAuth(token, expiresAt)
  return true
}
