import { useEffect, useState } from 'react'

export function SettingsView(): React.JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.api.getConfig().then((config) => {
      setApiKey(config.finnhubApiKey ?? '')
    })
  }, [])

  async function handleSave(): Promise<void> {
    await window.api.setApiKey(apiKey.trim() || null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="view">
      <h2>הגדרות</h2>

      <div className="settings-card">
        <h3>מקורות נתונים</h3>
        <p className="muted">
          נתוני מחיר יומיים והרמות הטכניות מגיעים מ-Stooq ואינם דורשים מפתח API — האפליקציה עובדת
          מיד ללא הגדרה. מפתח Finnhub הוא אופציונלי ומשמש רק לקבלת מחיר עדכני (quote) מעבר לנתוני
          הסגירה היומיים.
        </p>
        <label htmlFor="finnhub-key">מפתח Finnhub (אופציונלי)</label>
        <input
          id="finnhub-key"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="הדבק כאן מפתח API חינמי מ-finnhub.io"
          className="ticker-input full-width"
        />
        <button onClick={handleSave}>שמור</button>
        {saved && <span className="saved-indicator">נשמר ✓</span>}
      </div>

      <div className="settings-card">
        <h3>הבהרה</h3>
        <p className="muted">
          הכלי מבצע ניתוח טכני אוטומטי (רמות מחיר, נפח, מומנטום) כדי לקצר את זמן הבדיקה הראשוני של
          גרף. הציון והסיכום אינם המלצת השקעה, ואינם מחליפים שיקול דעת ובדיקה נוספת לפני כניסה
          לפוזיציה — בפרט במניות penny stock שבהן הנזילות והתנודתיות גבוהות.
        </p>
      </div>
    </div>
  )
}
