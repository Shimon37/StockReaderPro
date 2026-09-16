import { ElectronAPI } from '@electron-toolkit/preload'
import type { StockReaderApi } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: StockReaderApi
  }
}
