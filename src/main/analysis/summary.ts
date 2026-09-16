import type { BreakoutInfo, Indicators, ScoreFactor } from '@shared/types'

function breakoutSentence(symbol: string, breakout: BreakoutInfo): string {
  const level = breakout.level?.price.toFixed(2)
  switch (breakout.state) {
    case 'breakout':
      return `${symbol} פרץ מעל רמת התנגדות באזור ${level}$.`
    case 'breakdown':
      return `${symbol} שבר כלפי מטה רמת תמיכה באזור ${level}$.`
    case 'approaching_resistance':
      return `${symbol} נמצא כ-${breakout.distancePercent?.toFixed(1)}% מתחת לרמת התנגדות באזור ${level}$.`
    case 'approaching_support':
      return `${symbol} נמצא כ-${breakout.distancePercent?.toFixed(1)}% מעל רמת תמיכה באזור ${level}$.`
    case 'inside_range':
      return `${symbol} נסחר כרגע בתוך טווח, ללא קרבה לרמת מפתח בולטת.`
    default:
      return `אין מספיק היסטוריה עבור ${symbol} כדי לזהות רמות מחיר אמינות.`
  }
}

function volumeSentence(indicators: Indicators): string | null {
  const rv = indicators.relativeVolume
  if (rv === null) return null
  if (rv >= 2) return `נפח המסחר גבוה פי ${rv.toFixed(1)} מהממוצע של 20 הימים האחרונים.`
  if (rv < 0.6) return `נפח המסחר נמוך מהרגיל — ייתכנו מרווחי מחיר (spread) רחבים.`
  return `נפח המסחר קרוב לממוצע הרגיל.`
}

function momentumSentence(indicators: Indicators): string | null {
  if (indicators.rsi14 === null) return null
  if (indicators.rsi14 > 80)
    return `ה-RSI גבוה מאוד (${indicators.rsi14.toFixed(0)}), מצב שמוגדר לרוב כקניית יתר.`
  if (indicators.rsi14 < 30)
    return `ה-RSI נמוך (${indicators.rsi14.toFixed(0)}), מצב שמוגדר לרוב כמכירת יתר.`
  return null
}

export function buildSummary(
  symbol: string,
  indicators: Indicators,
  breakout: BreakoutInfo,
  score: number,
  factors: ScoreFactor[]
): string {
  const sentences = [breakoutSentence(symbol, breakout)]

  const vol = volumeSentence(indicators)
  if (vol) sentences.push(vol)

  const momentum = momentumSentence(indicators)
  if (momentum) sentences.push(momentum)

  const topFactors = [...factors]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 2)
  const factorText = topFactors
    .map((f) => `${f.label} (${f.impact > 0 ? '+' : ''}${f.impact})`)
    .join(', ')

  sentences.push(`ציון ${score}/100. הגורמים המרכזיים: ${factorText}.`)
  sentences.push('זהו סיכום טכני אוטומטי בלבד ואינו המלצת קנייה או מכירה — ההחלטה בידיך.')

  return sentences.join(' ')
}
