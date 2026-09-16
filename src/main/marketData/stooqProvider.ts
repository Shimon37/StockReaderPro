import type { Candle } from '@shared/types'

/**
 * Stooq serves free daily OHLCV history with no API key and no rate-limit
 * registration, so it is the zero-setup default data source. Coverage for
 * thinly-traded OTC penny stocks is not guaranteed; callers should treat an
 * empty result as "symbol not found" rather than a hard error.
 */
export async function fetchDailyCandles(symbol: string): Promise<Candle[]> {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol.toLowerCase())}.us&i=d`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Stooq request failed with status ${response.status}`)
  }
  const text = await response.text()
  return parseStooqCsv(text)
}

export function parseStooqCsv(csv: string): Candle[] {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []
  if (lines[0].trim().toUpperCase().startsWith('DATE') === false) return []

  const candles: Candle[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const [date, open, high, low, close, volume] = line.split(',')
    if (!date || open === undefined) continue
    const time = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000)
    if (Number.isNaN(time)) continue
    candles.push({
      time,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume ?? 0)
    })
  }
  return candles.sort((a, b) => a.time - b.time)
}
