import type { BreakoutState } from '@shared/types'

export const BREAKOUT_LABELS: Record<BreakoutState, string> = {
  breakout: 'פריצה למעלה',
  breakdown: 'שבירה למטה',
  approaching_resistance: 'מתקרב להתנגדות',
  approaching_support: 'מתקרב לתמיכה',
  inside_range: 'בטווח מסחר',
  insufficient_data: 'אין מספיק נתונים'
}
