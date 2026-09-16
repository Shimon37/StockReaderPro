import { useState } from 'react'
import { WatchlistView } from './components/WatchlistView'
import { TickerDetailView } from './components/TickerDetailView'
import { SettingsView } from './components/SettingsView'

type Route = { name: 'watchlist' } | { name: 'detail'; symbol: string } | { name: 'settings' }

function App(): React.JSX.Element {
  const [route, setRoute] = useState<Route>({ name: 'watchlist' })

  return (
    <div className="app">
      <header className="app-header">
        <h1>StockReaderPro</h1>
        <nav>
          <button
            className={route.name === 'watchlist' || route.name === 'detail' ? 'active' : ''}
            onClick={() => setRoute({ name: 'watchlist' })}
          >
            רשימת מעקב
          </button>
          <button
            className={route.name === 'settings' ? 'active' : ''}
            onClick={() => setRoute({ name: 'settings' })}
          >
            הגדרות
          </button>
        </nav>
      </header>

      <main className="app-main">
        {route.name === 'watchlist' && (
          <WatchlistView onSelectSymbol={(symbol) => setRoute({ name: 'detail', symbol })} />
        )}
        {route.name === 'detail' && (
          <TickerDetailView symbol={route.symbol} onBack={() => setRoute({ name: 'watchlist' })} />
        )}
        {route.name === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}

export default App
