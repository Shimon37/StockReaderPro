import type { Candle, Indicators } from '@shared/types'

function sma(values: number[], period: number): number | null {
  if (values.length < period) return null
  const slice = values.slice(values.length - period)
  return slice.reduce((sum, v) => sum + v, 0) / period
}

function rsi(closes: number[], period: number): number | null {
  if (closes.length < period + 1) return null
  const changes = closes.slice(closes.length - period - 1).map((c, i, arr) => {
    if (i === 0) return 0
    return c - arr[i - 1]
  })
  const gains = changes.slice(1).filter((c) => c > 0)
  const losses = changes.slice(1).filter((c) => c < 0)
  const avgGain = gains.reduce((s, v) => s + v, 0) / period
  const avgLoss = Math.abs(losses.reduce((s, v) => s + v, 0)) / period
  if (avgLoss === 0) return avgGain === 0 ? 50 : 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

function atr(candles: Candle[], period: number): number | null {
  if (candles.length < period + 1) return null
  const trueRanges: number[] = []
  for (let i = candles.length - period; i < candles.length; i++) {
    const current = candles[i]
    const prevClose = candles[i - 1].close
    const highLow = current.high - current.low
    const highPrevClose = Math.abs(current.high - prevClose)
    const lowPrevClose = Math.abs(current.low - prevClose)
    trueRanges.push(Math.max(highLow, highPrevClose, lowPrevClose))
  }
  return trueRanges.reduce((s, v) => s + v, 0) / period
}

function relativeVolume(candles: Candle[], period: number): number | null {
  if (candles.length < period + 1) return null
  const last = candles[candles.length - 1].volume
  const priorSlice = candles.slice(candles.length - period - 1, candles.length - 1)
  const avg = priorSlice.reduce((s, c) => s + c.volume, 0) / period
  if (avg === 0) return null
  return last / avg
}

function percentChange(candles: Candle[], barsBack: number): number | null {
  if (candles.length < barsBack + 1) return null
  const last = candles[candles.length - 1].close
  const past = candles[candles.length - 1 - barsBack].close
  if (past === 0) return null
  return ((last - past) / past) * 100
}

export function computeIndicators(candles: Candle[]): Indicators {
  const closes = candles.map((c) => c.close)
  const atr14 = atr(candles, 14)
  const lastClose = closes[closes.length - 1] ?? null

  return {
    sma20: sma(closes, 20),
    sma50: sma(closes, 50),
    rsi14: rsi(closes, 14),
    atr14,
    atrPercent: atr14 !== null && lastClose ? (atr14 / lastClose) * 100 : null,
    relativeVolume: relativeVolume(candles, 20),
    changePercent1d: percentChange(candles, 1),
    changePercent5d: percentChange(candles, 5)
  }
}
