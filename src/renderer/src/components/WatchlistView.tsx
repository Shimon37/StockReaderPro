import { useEffect, useState } from 'react'
import type { AnalysisResult } from '@shared/types'
import { ScoreBadge } from './ScoreBadge'
import { BREAKOUT_LABELS } from '../labels'

interface Props {
  onSelectSymbol: (symbol: string) => void
}

export function WatchlistView({ onSelectSymbol }: Props): React.JSX.Element {
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [newSymbol, setNewSymbol] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function refresh(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const data = await window.api.scanWatchlist()
      setResults(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    refresh()
  }, [])

  async function handleAdd(): Promise<void> {
    const symbol = newSymbol.trim().toUpperCase()
    if (!symbol) return
    await window.api.addToWatchlist(symbol)
    setNewSymbol('')
    await refresh()
  }

  async function handleRemove(symbol: string): Promise<void> {
    await window.api.removeFromWatchlist(symbol)
    await refresh()
  }

  return (
    <div className="view">
      <div className="toolbar">
        <input
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="הוסף טיקר, למשל AAPL"
          className="ticker-input"
        />
        <button onClick={handleAdd}>הוסף</button>
        <button onClick={refresh} disabled={loading}>
          {loading ? 'סורק...' : 'רענן סריקה'}
        </button>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {results.length === 0 && !loading ? (
        <div className="empty-state">רשימת המעקב ריקה. הוסף טיקר כדי להתחיל.</div>
      ) : (
        <table className="watchlist-table">
          <thead>
            <tr>
              <th>טיקר</th>
              <th>ציון</th>
              <th>מצב</th>
              <th>נפח יחסי</th>
              <th>RSI</th>
              <th>שינוי יומי</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.symbol} onClick={() => onSelectSymbol(r.symbol)} className="clickable-row">
                <td className="symbol-cell">{r.symbol}</td>
                <td>
                  <ScoreBadge score={r.score} />
                </td>
                <td>{BREAKOUT_LABELS[r.breakout.state]}</td>
                <td>
                  {r.indicators.relativeVolume ? `x${r.indicators.relativeVolume.toFixed(1)}` : '—'}
                </td>
                <td>{r.indicators.rsi14 ? r.indicators.rsi14.toFixed(0) : '—'}</td>
                <td className={(r.indicators.changePercent1d ?? 0) >= 0 ? 'positive' : 'negative'}>
                  {r.indicators.changePercent1d !== null
                    ? `${r.indicators.changePercent1d >= 0 ? '+' : ''}${r.indicators.changePercent1d.toFixed(1)}%`
                    : '—'}
                </td>
                <td>
                  <button
                    className="icon-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(r.symbol)
                    }}
                    title="הסר מרשימת המעקב"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
