// Shared chart utilities for consistent styling and formatting across components

// Color palette for different activities
export const CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00ff00',
  '#0088fe',
  '#ff8042',
  '#8dd1e1',
  '#d084d0',
  '#ffb347',
]

// Function to get consistent color for each activity
export const getColorForActivity = (activityName: string) => {
  // Use a simple hash function to consistently assign colors to activity names
  const hash = activityName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  return CHART_COLORS[Math.abs(hash) % CHART_COLORS.length]
}

// Shared tooltip formatter for duration values
export const formatDurationTooltip = (value: number, name: string) => {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  return [timeStr, name]
}

// Shared Y-axis tick formatter for duration values
export const formatDurationYAxisTick = (value: number) => {
  const hours = Math.floor(value / 60)
  return hours > 0 ? `${hours}h` : `${value}m`
}
