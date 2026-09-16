import type { Quote } from '@shared/types'

/**
 * Finnhub's free-tier /quote endpoint gives a near-real-time last price,
 * used to enrich Stooq's end-of-day candles with a current price when the
 * user has supplied their own free API key. Optional by design: the app
 * must work with zero configuration using Stooq alone.
 */
export async function fetchQuote(symbol: string, apiKey: string): Promise<Quote | null> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(apiKey)}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Finnhub request failed with status ${response.status}`)
  }
  const data = (await response.json()) as { c: number; pc: number; t: number }
  if (!data || (data.c === 0 && data.t === 0)) {
    return null
  }
  const change = data.c - data.pc
  return {
    price: data.c,
    change,
    changePercent: data.pc !== 0 ? (change / data.pc) * 100 : 0,
    previousClose: data.pc,
    asOf: data.t
  }
}
