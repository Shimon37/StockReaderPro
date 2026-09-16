import { useEffect, useState } from 'react'
import type { AnalysisResult } from '@shared/types'
import { ChartPanel } from './ChartPanel'
import { ScoreBadge } from './ScoreBadge'
import { BREAKOUT_LABELS } from '../labels'

interface Props {
  symbol: string
  onBack: () => void
}

export function TickerDetailView({ symbol, onBack }: Props): React.JSX.Element {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const data = await window.api.analyzeSymbol(symbol)
      setResult(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch analysis when symbol changes
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol])

  return (
    <div className="view">
      <div className="toolbar">
        <button onClick={onBack}>← חזרה לרשימה</button>
        <h2 className="detail-title">{symbol}</h2>
        <button onClick={load} disabled={loading}>
          {loading ? 'מרענן...' : 'רענן'}
        </button>
      </div>

      {error && <div className="banner banner-error">{error}</div>}
      {!result && loading && <div className="empty-state">טוען ניתוח...</div>}

      {result && (
        <>
          {result.warning && <div className="banner banner-warning">{result.warning}</div>}

          <div className="detail-header">
            <ScoreBadge score={result.score} />
            <div>
              <div className="detail-price">
                {result.quote
                  ? `$${result.quote.price.toFixed(2)}`
                  : `$${result.candles.at(-1)?.close.toFixed(2) ?? '—'}`}
              </div>
              <div className="detail-state">{BREAKOUT_LABELS[result.breakout.state]}</div>
            </div>
          </div>

          {result.candles.length > 0 && (
            <ChartPanel candles={result.candles} levels={result.levels} />
          )}

          <div className="summary-box">
            <h3>סיכום אוטומטי</h3>
            <p>{result.summary}</p>
          </div>

          {result.factors.length > 0 && (
            <div className="factors-box">
              <h3>גורמים שהשפיעו על הציון</h3>
              <ul>
                {result.factors.map((f, i) => (
                  <li key={i} className={f.impact >= 0 ? 'positive' : 'negative'}>
                    <strong>
                      {f.label} ({f.impact > 0 ? '+' : ''}
                      {f.impact})
                    </strong>
                    <span> — {f.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
