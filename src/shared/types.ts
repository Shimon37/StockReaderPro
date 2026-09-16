export interface Candle {
  time: number // unix seconds, UTC
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Quote {
  price: number
  change: number
  changePercent: number
  previousClose: number
  asOf: number // unix seconds
}

export type LevelKind = 'support' | 'resistance'

export interface PriceLevel {
  kind: LevelKind
  price: number
  strength: number // number of touches contributing to this level
}

export type BreakoutState =
  | 'breakout'
  | 'breakdown'
  | 'approaching_resistance'
  | 'approaching_support'
  | 'inside_range'
  | 'insufficient_data'

export interface BreakoutInfo {
  state: BreakoutState
  level: PriceLevel | null
  distancePercent: number | null
  volumeMultiple: number | null // current volume vs average volume
}

export interface Indicators {
  sma20: number | null
  sma50: number | null
  rsi14: number | null
  atr14: number | null
  atrPercent: number | null
  relativeVolume: number | null // last bar volume vs N-bar average
  changePercent1d: number | null
  changePercent5d: number | null
}

export interface ScoreFactor {
  label: string
  impact: number // signed contribution to the score, -100..100 scale
  detail: string
}

export interface AnalysisResult {
  symbol: string
  asOf: number
  quote: Quote | null
  candles: Candle[]
  indicators: Indicators
  levels: PriceLevel[]
  breakout: BreakoutInfo
  score: number // 0-100, higher = more "worth a closer look" setup
  factors: ScoreFactor[]
  summary: string
  dataSource: 'stooq' | 'finnhub' | 'mixed'
  warning: string | null
}

export interface AppConfig {
  finnhubApiKey: string | null
  watchlist: string[]
}
