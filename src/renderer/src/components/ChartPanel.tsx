import { useEffect, useRef } from 'react'
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineStyle,
  type IChartApi,
  type UTCTimestamp
} from 'lightweight-charts'
import type { Candle, PriceLevel } from '@shared/types'

interface Props {
  candles: Candle[]
  levels: PriceLevel[]
}

export function ChartPanel({ candles, levels }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const chart = createChart(container, {
      layout: { background: { color: '#12141a' }, textColor: '#c7cad1' },
      grid: {
        vertLines: { color: '#1f232c' },
        horzLines: { color: '#1f232c' }
      },
      width: container.clientWidth,
      height: 420,
      rightPriceScale: { borderColor: '#2a2f3a' },
      timeScale: { borderColor: '#2a2f3a' }
    })
    chartRef.current = chart

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350'
    })
    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
      }))
    )

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume'
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } })
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)'
      }))
    )

    for (const level of levels) {
      candleSeries.createPriceLine({
        price: level.price,
        color: level.kind === 'resistance' ? '#ef5350' : '#26a69a',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: level.kind === 'resistance' ? 'התנגדות' : 'תמיכה'
      })
    }

    chart.timeScale().fitContent()

    const handleResize = (): void => {
      chart.applyOptions({ width: container.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [candles, levels])

  return <div ref={containerRef} className="chart-panel" />
}
