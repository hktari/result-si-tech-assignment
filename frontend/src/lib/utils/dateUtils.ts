/**
 * Converts a dateRange string to start and end date strings
 */
export function dateRangeToStartEnd(dateRange: string): { start: string; end: string } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  let start: Date
  let end: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today
  
  switch (dateRange) {
    case 'today':
      start = new Date(today)
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
    end: end.toISOString().split('T')[0]
  }
}
