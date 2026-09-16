import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { AnalysisResult, AppConfig } from '@shared/types'

const api = {
  getConfig: (): Promise<AppConfig> => ipcRenderer.invoke('config:get'),
  setApiKey: (apiKey: string | null): Promise<AppConfig> =>
    ipcRenderer.invoke('config:setApiKey', apiKey),
  addToWatchlist: (symbol: string): Promise<string[]> =>
    ipcRenderer.invoke('watchlist:add', symbol),
  removeFromWatchlist: (symbol: string): Promise<string[]> =>
    ipcRenderer.invoke('watchlist:remove', symbol),
  analyzeSymbol: (symbol: string): Promise<AnalysisResult> =>
    ipcRenderer.invoke('analysis:getSymbol', symbol),
  scanWatchlist: (): Promise<AnalysisResult[]> => ipcRenderer.invoke('analysis:scanWatchlist')
}

export type StockReaderApi = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
