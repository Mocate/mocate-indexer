import type { OperationalHour } from '../types/models'

export function getCurrentDayName(): string {
  const dayIndex = new Date().getDay()
  // JS getDay(): 0=Sunday, remap to match our DAYS_OF_WEEK (Monday-first)
  const jsOrder = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  return jsOrder[dayIndex] ?? ''
}

export function isOpenNow(hours: OperationalHour[]): boolean {
  const now = new Date()
  const currentDay = getCurrentDayName()
  const todayHours = hours.find((h) => h.working_day === currentDay)

  if (!todayHours) {
    return false
  }

  const currentTime = formatTimeString(now)
  return (
    currentTime >= todayHours.opens_at && currentTime < todayHours.closes_at
  )
}

function formatTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatTime(time: string): string {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}
