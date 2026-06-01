export function formatMoney(value = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

export function formatNumber(value = 0) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0))
}

export function formatDate(value) {
  if (!value) return 'Not set'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value) {
  if (!value) return 'Just now'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function toInputDate(value) {
  if (!value) return ''

  return new Date(value).toISOString().slice(0, 10)
}

export function initials(email = '') {
  const name = email.split('@')[0] || 'VM'

  return name
    .split(/[._-]/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
