import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { Candle, Quote } from '@shared/types'

interface CacheEntry<T> {
  fetchedAt: number
  data: T
}

interface CacheFile {
  candles: Record<string, CacheEntry<Candle[]>>
  quotes: Record<string, CacheEntry<Quote>>
}

const EMPTY_CACHE: CacheFile = { candles: {}, quotes: {} }

function cachePath(): string {
  return join(app.getPath('userData'), 'market-cache.json')
}

function readCache(): CacheFile {
  const path = cachePath()
  if (!existsSync(path)) return { ...EMPTY_CACHE }
  try {
    const raw = JSON.parse(readFileSync(path, 'utf-8'))
    return {
      candles: raw.candles ?? {},
      quotes: raw.quotes ?? {}
    }
  } catch {
    return { ...EMPTY_CACHE }
  }
}

function writeCache(cache: CacheFile): void {
  mkdirSync(app.getPath('userData'), { recursive: true })
  writeFileSync(cachePath(), JSON.stringify(cache), 'utf-8')
}

export function getCachedCandles(symbol: string, maxAgeMs: number): Candle[] | null {
  const cache = readCache()
  const entry = cache.candles[symbol]
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > maxAgeMs) return null
  return entry.data
}

export function setCachedCandles(symbol: string, candles: Candle[]): void {
  const cache = readCache()
  cache.candles[symbol] = { fetchedAt: Date.now(), data: candles }
  writeCache(cache)
}

export function getCachedQuote(symbol: string, maxAgeMs: number): Quote | null {
  const cache = readCache()
  const entry = cache.quotes[symbol]
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > maxAgeMs) return null
  return entry.data
}

export function setCachedQuote(symbol: string, quote: Quote): void {
  const cache = readCache()
  cache.quotes[symbol] = { fetchedAt: Date.now(), data: quote }
  writeCache(cache)
}
