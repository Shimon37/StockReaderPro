import type { AnalysisResult } from '@shared/types'
import { getMarketData } from '../marketData'
import { computeIndicators } from './indicators'
import { computeLevels } from './levels'
import { detectBreakout } from './breakout'
import { computeScore } from './score'
import { buildSummary } from './summary'

export async function analyzeSymbol(
  symbol: string,
  finnhubApiKey: string | null
): Promise<AnalysisResult> {
  const upperSymbol = symbol.toUpperCase().trim()
  const { candles, quote, dataSource, warning } = await getMarketData(upperSymbol, finnhubApiKey)

  if (candles.length === 0) {
    return {
      symbol: upperSymbol,
      asOf: Math.floor(Date.now() / 1000),
      quote,
      candles: [],
      indicators: {
        sma20: null,
        sma50: null,
        rsi14: null,
        atr14: null,
        atrPercent: null,
        relativeVolume: null,
        changePercent1d: null,
        changePercent5d: null
      },
      levels: [],
      breakout: {
        state: 'insufficient_data',
        level: null,
        distancePercent: null,
        volumeMultiple: null
      },
      score: 0,
      factors: [],
      summary: warning ?? `לא נמצאו נתונים עבור ${upperSymbol}.`,
      dataSource,
      warning
    }
  }

  const currentPrice = quote?.price ?? candles[candles.length - 1].close
  const indicators = computeIndicators(candles)
  const levels = computeLevels(candles, currentPrice)
  const breakout = detectBreakout(candles, levels, indicators.relativeVolume)
  const { score, factors } = computeScore(indicators, breakout)
  const summary = buildSummary(upperSymbol, indicators, breakout, score, factors)

  return {
    symbol: upperSymbol,
    asOf: Math.floor(Date.now() / 1000),
    quote,
    candles,
    indicators,
    levels,
    breakout,
    score,
    factors,
    summary,
    dataSource,
    warning
  }
}

export async function scanWatchlist(
  symbols: string[],
  finnhubApiKey: string | null
): Promise<AnalysisResult[]> {
  const results = await Promise.all(symbols.map((symbol) => analyzeSymbol(symbol, finnhubApiKey)))
  return results.sort((a, b) => b.score - a.score)
}
