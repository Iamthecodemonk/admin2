const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.skills4export.com'
const TOKEN_KEY = 'skills4export_admin_token'
const USER_KEY = 'skills4export_admin_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveSession(payload) {
  const token = payload?.token || payload?.data?.api_token
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (payload?.data) localStorage.setItem(USER_KEY, JSON.stringify(payload.data))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function normalizeError(status, data) {
  return data?.message || data?.error?.message || data?.error || `Request failed with status ${status}`
}

export async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = new Headers(options.headers || {})
  const isFormData = options.body instanceof FormData

  if (!isFormData && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: isFormData || typeof options.body === 'string' ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const error = new Error(normalizeError(response.status, data))
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export function getPaginatorData(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

export async function login(email, password) {
  const data = await apiRequest('/api/login', {
    method: 'POST',
    body: { email, password },
  })
  saveSession(data)
  return data
}

export async function logout() {
  try {
    await apiRequest('/api/logout', { method: 'POST' })
  } finally {
    clearSession()
  }
}

export function toQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value)
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}
