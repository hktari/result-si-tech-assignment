export function getMondayOfThisWeek(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 (Sunday) to 6 (Saturday)
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust for Sunday
  const monday = new Date(today.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

/**
 * Converts a dateRange string to start and end date strings
 */
export function dateRangeToStartEnd(dateRange: string): {
  start: string
  end: string
} {
  const now = new Date()
  const today = new Date()

  let start: Date
  let end: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today

  switch (dateRange) {
    case 'today':
      start = today
      break

    case 'yesterday':
      start = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      end = new Date(today.getTime() - 1)
      break

    case 'last7days':
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      break

    case 'last30days':
      start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      break

    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break

    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1)
      break

    default:
      // Default to last 7 days
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  return {
    start: start.toISOString().split('T')[0], // Format as YYYY-MM-DD
    end: end.toISOString().split('T')[0],
  }
}
