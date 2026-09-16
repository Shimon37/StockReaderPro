import type { Candle, PriceLevel } from '@shared/types'

interface Pivot {
  price: number
  isHigh: boolean
}

function findPivots(candles: Candle[], wing = 3): Pivot[] {
  const pivots: Pivot[] = []
  for (let i = wing; i < candles.length - wing; i++) {
    const window = candles.slice(i - wing, i + wing + 1)
    const current = candles[i]
    const isHigh = window.every((c) => c.high <= current.high)
    const isLow = window.every((c) => c.low >= current.low)
    if (isHigh) pivots.push({ price: current.high, isHigh: true })
    if (isLow) pivots.push({ price: current.low, isHigh: false })
  }
  return pivots
}

/**
 * Groups nearby pivot prices into levels: pivots within `tolerancePercent`
 * of each other are treated as the same support/resistance zone, and the
 * number of pivots merged into a level is its "strength" (touch count).
 */
export function computeLevels(
  candles: Candle[],
  currentPrice: number,
  tolerancePercent = 1.5
): PriceLevel[] {
  const pivots = findPivots(candles).sort((a, b) => a.price - b.price)
  if (pivots.length === 0) return []

  const clusters: { prices: number[]; isHigh: boolean }[] = []
  for (const pivot of pivots) {
    const last = clusters[clusters.length - 1]
    if (
      last &&
      (Math.abs(pivot.price - last.prices[last.prices.length - 1]) / pivot.price) * 100 <=
        tolerancePercent
    ) {
      last.prices.push(pivot.price)
      last.isHigh = last.isHigh || pivot.isHigh
    } else {
      clusters.push({ prices: [pivot.price], isHigh: pivot.isHigh })
    }
  }

  return clusters
    .map((cluster) => {
      const avgPrice = cluster.prices.reduce((s, p) => s + p, 0) / cluster.prices.length
      return {
        kind: (avgPrice >= currentPrice ? 'resistance' : 'support') as PriceLevel['kind'],
        price: avgPrice,
        strength: cluster.prices.length
      }
    })
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8)
}
