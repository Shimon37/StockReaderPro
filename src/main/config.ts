import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { AppConfig } from '@shared/types'

const DEFAULT_CONFIG: AppConfig = {
  finnhubApiKey: null,
  watchlist: ['AAPL']
}

function configPath(): string {
  return join(app.getPath('userData'), 'config.json')
}

export function loadConfig(): AppConfig {
  const path = configPath()
  if (!existsSync(path)) {
    return { ...DEFAULT_CONFIG }
  }
  try {
    const raw = readFileSync(path, 'utf-8')
    const parsed = JSON.parse(raw)
    return {
      finnhubApiKey: typeof parsed.finnhubApiKey === 'string' ? parsed.finnhubApiKey : null,
      watchlist: Array.isArray(parsed.watchlist) ? parsed.watchlist : DEFAULT_CONFIG.watchlist
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function saveConfig(config: AppConfig): void {
  const path = configPath()
  mkdirSync(join(app.getPath('userData')), { recursive: true })
  writeFileSync(path, JSON.stringify(config, null, 2), 'utf-8')
}
