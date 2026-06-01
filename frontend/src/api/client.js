const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5064/api'

export async function apiGet(path) {
  return apiRequest(path)
}

export async function apiPost(path, body) {
  return apiRequest(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function apiPut(path, body) {
  return apiRequest(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function apiDelete(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error(await errorMessage(response))
  }
}

async function apiRequest(path, options = {}) {
  const headers = {
    ...authHeaders(),
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(await errorMessage(response))
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

async function errorMessage(response) {
  try {
    const data = await response.json()
    return data.message || data.title || `Request failed with ${response.status}`
  } catch {
    return `Request failed with ${response.status}`
  }
}

function authHeaders() {
  const token =
    localStorage.getItem('vmsToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('vmsToken') ||
    sessionStorage.getItem('token')

  return token ? { Authorization: `Bearer ${token}` } : {}
}
