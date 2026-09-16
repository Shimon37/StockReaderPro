import { ipcMain } from 'electron'
import type { AppConfig } from '@shared/types'
import { loadConfig, saveConfig } from './config'
import { analyzeSymbol, scanWatchlist } from './analysis'

export function registerIpcHandlers(): void {
  ipcMain.handle('config:get', (): AppConfig => {
    return loadConfig()
  })

  ipcMain.handle('config:setApiKey', (_event, apiKey: string | null) => {
    const config = loadConfig()
    config.finnhubApiKey = apiKey && apiKey.trim() !== '' ? apiKey.trim() : null
    saveConfig(config)
    return config
  })

  ipcMain.handle('watchlist:add', (_event, symbol: string) => {
    const config = loadConfig()
    const upper = symbol.toUpperCase().trim()
    if (upper && !config.watchlist.includes(upper)) {
      config.watchlist.push(upper)
      saveConfig(config)
    }
    return config.watchlist
  })

  ipcMain.handle('watchlist:remove', (_event, symbol: string) => {
    const config = loadConfig()
    config.watchlist = config.watchlist.filter((s) => s !== symbol.toUpperCase().trim())
    saveConfig(config)
    return config.watchlist
  })

  ipcMain.handle('analysis:getSymbol', async (_event, symbol: string) => {
    const config = loadConfig()
    return analyzeSymbol(symbol, config.finnhubApiKey)
  })

  ipcMain.handle('analysis:scanWatchlist', async () => {
    const config = loadConfig()
    if (config.watchlist.length === 0) return []
    return scanWatchlist(config.watchlist, config.finnhubApiKey)
  })
}
