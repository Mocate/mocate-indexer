export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

export const NETWORK_OPTIONS = [
  'MTN',
  'Telecel',
  'AirtelTigo',
  'GMoney',
] as const

export const DEFAULT_COUNTRY = 'Ghana'

export const DEFAULT_MAP_CENTER = {
  lat: 5.6037,
  lon: -0.187,
} as const
