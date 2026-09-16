import type { BreakoutInfo, Indicators, ScoreFactor } from '@shared/types'

/**
 * Composite 0-100 "worth a closer look" score. This does not recommend
 * buying or selling — it only quantifies how much technical signal and
 * confirmation is present right now, with every contributing factor listed
 * so the trader can see exactly why, and disagree.
 */
export function computeScore(
  indicators: Indicators,
  breakout: BreakoutInfo
): { score: number; factors: ScoreFactor[] } {
  const factors: ScoreFactor[] = []

  switch (breakout.state) {
    case 'breakout':
      factors.push({
        label: 'פריצת התנגדות',
        impact: 28,
        detail: `המחיר חצה מעל רמת התנגדות ב-${breakout.level?.price.toFixed(2)}$`
      })
      break
    case 'approaching_resistance':
      factors.push({
        label: 'מתקרב להתנגדות',
        impact: 12,
        detail: `${breakout.distancePercent?.toFixed(1)}% מתחת לרמת התנגדות ב-${breakout.level?.price.toFixed(2)}$`
      })
      break
    case 'breakdown':
      factors.push({
        label: 'שבירת תמיכה',
        impact: -18,
        detail: `המחיר שבר כלפי מטה רמת תמיכה ב-${breakout.level?.price.toFixed(2)}$`
      })
      break
    case 'approaching_support':
      factors.push({
        label: 'מתקרב לתמיכה',
        impact: 8,
        detail: `${breakout.distancePercent?.toFixed(1)}% מעל רמת תמיכה ב-${breakout.level?.price.toFixed(2)}$ (אזור אפשרי לתגובה)`
      })
      break
    case 'inside_range':
      factors.push({ label: 'בתוך טווח מסחר', impact: 0, detail: 'אין קרבה משמעותית לרמת מפתח' })
      break
    case 'insufficient_data':
      factors.push({ label: 'מעט נתונים', impact: 0, detail: 'לא נמצאו מספיק רמות מחיר לניתוח' })
      break
  }

  const rv = indicators.relativeVolume
  if (rv !== null) {
    if (rv >= 3) {
      factors.push({
        label: 'נפח חריג',
        impact: 22,
        detail: `נפח המסחר גבוה פי ${rv.toFixed(1)} מהממוצע`
      })
    } else if (rv >= 2) {
      factors.push({
        label: 'נפח גבוה',
        impact: 14,
        detail: `נפח המסחר גבוה פי ${rv.toFixed(1)} מהממוצע`
      })
    } else if (rv >= 1.5) {
      factors.push({
        label: 'נפח מוגבר מעט',
        impact: 6,
        detail: `נפח המסחר גבוה פי ${rv.toFixed(1)} מהממוצע`
      })
    } else if (rv < 0.5) {
      factors.push({
        label: 'נפח דל',
        impact: -12,
        detail: 'נפח המסחר נמוך משמעותית מהממוצע — סיכון נזילות בכניסה/יציאה'
      })
    }
  }

  const rsi = indicators.rsi14
  if (rsi !== null) {
    if (rsi > 80) {
      factors.push({
        label: 'קניית יתר קיצונית (RSI)',
        impact: -15,
        detail: `RSI = ${rsi.toFixed(0)}, סיכון תיקון חד`
      })
    } else if (rsi >= 50 && rsi <= 75) {
      factors.push({ label: 'מומנטום חיובי (RSI)', impact: 8, detail: `RSI = ${rsi.toFixed(0)}` })
    } else if (rsi < 30) {
      factors.push({ label: 'חולשה (RSI)', impact: -5, detail: `RSI = ${rsi.toFixed(0)}` })
    }
  }

  if (indicators.changePercent1d !== null && indicators.changePercent1d > 25) {
    factors.push({
      label: 'ריצה חדה כבר קרתה',
      impact: -10,
      detail: `+${indicators.changePercent1d.toFixed(0)}% ביום המסחר האחרון — כניסה כאן היא רדיפה אחרי המחיר`
    })
  }

  if (indicators.atrPercent !== null && indicators.atrPercent > 15) {
    factors.push({
      label: 'תנודתיות גבוהה',
      impact: -6,
      detail: `טווח יומי ממוצע (ATR) של כ-${indicators.atrPercent.toFixed(0)}% מהמחיר — סטופים צריכים להיות רחבים בהתאם`
    })
  }

  const rawScore = 50 + factors.reduce((sum, f) => sum + f.impact, 0)
  const score = Math.max(0, Math.min(100, Math.round(rawScore)))

  return { score, factors }
}
