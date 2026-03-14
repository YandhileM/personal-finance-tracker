const BASE = '/api/sheets'

export async function readRange(range) {
  const res = await fetch(`${BASE}?range=${encodeURIComponent(range)}`)
  if (!res.ok) throw new Error(`Read failed: ${res.statusText}`)
  return res.json()
}

export async function appendRow(range, values) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'append', payload: { range, values } }),
  })
  if (!res.ok) throw new Error(`Append failed: ${res.statusText}`)
  return res.json()
}

export async function updateRange(range, values) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', payload: { range, values } }),
  })
  if (!res.ok) throw new Error(`Update failed: ${res.statusText}`)
  return res.json()
}
