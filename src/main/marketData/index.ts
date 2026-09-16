import type { Candle, Quote } from '@shared/types'
import { fetchDailyCandles } from './stooqProvider'
import { fetchQuote } from './finnhubProvider'
import { getCachedCandles, setCachedCandles, getCachedQuote, setCachedQuote } from './cache'

const CANDLES_MAX_AGE_MS = 6 * 60 * 60 * 1000 // 6h: daily bars don't need to be fresher
const QUOTE_MAX_AGE_MS = 60 * 1000 // 1 minute

export interface MarketDataBundle {
  candles: Candle[]
  quote: Quote | null
  dataSource: 'stooq' | 'finnhub' | 'mixed'
  warning: string | null
}

async function getDailyCandles(symbol: string): Promise<Candle[]> {
  const cached = getCachedCandles(symbol, CANDLES_MAX_AGE_MS)
  if (cached) return cached
  const candles = await fetchDailyCandles(symbol)
  if (candles.length > 0) {
    setCachedCandles(symbol, candles)
  }
  return candles
}

async function getLiveQuote(symbol: string, apiKey: string | null): Promise<Quote | null> {
  if (!apiKey) return null
  const cached = getCachedQuote(symbol, QUOTE_MAX_AGE_MS)
  if (cached) return cached
  const quote = await fetchQuote(symbol, apiKey)
  if (quote) {
    setCachedQuote(symbol, quote)
  }
  return quote
}

export async function getMarketData(
  symbol: string,
  finnhubApiKey: string | null
): Promise<MarketDataBundle> {
  const candles = await getDailyCandles(symbol)

  if (candles.length === 0) {
    return {
      candles: [],
      quote: null,
      dataSource: 'stooq',
      warning: `לא נמצאו נתוני מחיר עבור ${symbol}. ייתכן שהטיקר לא קיים במאגר הנתונים החינמי (נפוץ במניות OTC דלות מסחר).`
    }
  }

  let quote: Quote | null = null
  let warning: string | null = null
  try {
    quote = await getLiveQuote(symbol, finnhubApiKey)
  } catch (error) {
    warning = `לא ניתן היה לקבל מחיר עדכני מ-Finnhub (${(error as Error).message}). מוצגים נתוני הסגירה היומיים בלבד.`
  }

  return {
    candles,
    quote,
    dataSource: quote ? 'mixed' : 'stooq',
    warning
  }
}
