import type { BreakoutInfo, Candle, PriceLevel } from '@shared/types'

const APPROACH_THRESHOLD_PERCENT = 4

function percentAway(from: number, to: number): number {
  return ((to - from) / from) * 100
}

export function detectBreakout(
  candles: Candle[],
  levels: PriceLevel[],
  relativeVolume: number | null
): BreakoutInfo {
  if (candles.length < 2 || levels.length === 0) {
    return {
      state: 'insufficient_data',
      level: null,
      distancePercent: null,
      volumeMultiple: relativeVolume
    }
  }

  const last = candles[candles.length - 1]
  const prevClose = candles[candles.length - 2].close

  const resistances = levels
    .filter((l) => l.kind === 'resistance')
    .sort((a, b) => a.price - b.price)
  const supports = levels.filter((l) => l.kind === 'support').sort((a, b) => b.price - a.price)

  const brokenResistance = resistances.find((r) => prevClose < r.price && last.close > r.price)
  if (brokenResistance) {
    return {
      state: 'breakout',
      level: brokenResistance,
      distancePercent: percentAway(brokenResistance.price, last.close),
      volumeMultiple: relativeVolume
    }
  }

  const brokenSupport = supports.find((s) => prevClose > s.price && last.close < s.price)
  if (brokenSupport) {
    return {
      state: 'breakdown',
      level: brokenSupport,
      distancePercent: percentAway(brokenSupport.price, last.close),
      volumeMultiple: relativeVolume
    }
  }

  const nearestResistanceAbove = resistances.find((r) => r.price > last.close)
  if (nearestResistanceAbove) {
    const dist = percentAway(last.close, nearestResistanceAbove.price)
    if (dist <= APPROACH_THRESHOLD_PERCENT) {
      return {
        state: 'approaching_resistance',
        level: nearestResistanceAbove,
        distancePercent: dist,
        volumeMultiple: relativeVolume
      }
    }
  }

  const nearestSupportBelow = supports.find((s) => s.price < last.close)
  if (nearestSupportBelow) {
    const dist = percentAway(nearestSupportBelow.price, last.close)
    if (dist <= APPROACH_THRESHOLD_PERCENT) {
      return {
        state: 'approaching_support',
        level: nearestSupportBelow,
        distancePercent: dist,
        volumeMultiple: relativeVolume
      }
    }
  }

  return {
    state: 'inside_range',
    level: null,
    distancePercent: null,
    volumeMultiple: relativeVolume
  }
}
