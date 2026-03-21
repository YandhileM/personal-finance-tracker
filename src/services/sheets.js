import { getToken, clearAuth } from './auth.js'

const BASE = '/api/sheets'

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
}

function handle401(res) {
  if (res.status === 401) {
    clearAuth()
    window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }
}

export async function readRange(range) {
  const res = await fetch(`${BASE}?range=${encodeURIComponent(range)}`, {
    headers: getAuthHeaders(),
  })
  handle401(res)
  if (!res.ok) throw new Error(`Read failed: ${res.statusText}`)
  return res.json()
}

export async function appendRow(range, values) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action: 'append', payload: { range, values } }),
  })
  handle401(res)
  if (!res.ok) throw new Error(`Append failed: ${res.statusText}`)
  return res.json()
}

export async function updateRange(range, values) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action: 'update', payload: { range, values } }),
  })
  handle401(res)
  if (!res.ok) throw new Error(`Update failed: ${res.statusText}`)
  return res.json()
}
