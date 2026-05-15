import { useState, useEffect } from 'react'
import ColorPicker from './components/ColorPicker'
import PaletteDisplay from './components/PaletteDisplay'
import HistoryPanel from './components/HistoryPanel'
import { generatePalette } from './utils/colorUtils'

const STORAGE_KEY = 'color-palette-history'
const THEME_KEY = 'color-picker-theme'
const DEFAULT_COLOR = '#3a7bd5'

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export default function App() {
  const [baseColor, setBaseColor] = useState(DEFAULT_COLOR)
  const [harmony, setHarmony] = useState('analogous')
  const [palette, setPalette] = useState([])
  const [history, setHistory] = useState(loadHistory)
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')

  useEffect(() => {
    saveHistory(history)
  }, [history])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  function handleGenerate() {
    setPalette(generatePalette(baseColor, harmony))
  }

  function handleInsertColor(index, newColor) {
    setPalette((prev) => [...prev.slice(0, index), newColor, ...prev.slice(index)])
  }

  function handleSave() {
    if (!palette.length) return
    const entry = {
      id: Date.now(),
      baseColor,
      harmony,
      palette,
      createdAt: new Date().toISOString(),
    }
    setHistory((prev) => [entry, ...prev].slice(0, 50))
  }

  function handleRestore(entry) {
    setBaseColor(entry.baseColor)
    setHarmony(entry.harmony)
    setPalette(entry.palette)
  }

  function handleDeleteEntry(id) {
    setHistory((prev) => prev.filter((e) => e.id !== id))
  }

  function handleClearHistory() {
    setHistory([])
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>Color Palette Generator</h1>
            <p>Pick a base color, choose a harmony, and generate 5 complementary colors.</p>
          </div>
          <button className="theme-toggle" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="left-panel">
          <ColorPicker
            baseColor={baseColor}
            harmony={harmony}
            onColorChange={setBaseColor}
            onHarmonyChange={setHarmony}
            onGenerate={handleGenerate}
          />
        </section>

        <section className="right-panel">
          <PaletteDisplay palette={palette} onSave={handleSave} onInsertColor={handleInsertColor} />
          <HistoryPanel
            history={history}
            onRestore={handleRestore}
            onDelete={handleDeleteEntry}
            onClear={handleClearHistory}
          />
        </section>
      </main>
    </div>
  )
}
