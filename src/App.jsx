import { useState, useEffect } from 'react'
import ColorPicker from './components/ColorPicker'
import PaletteDisplay from './components/PaletteDisplay'
import HistoryPanel from './components/HistoryPanel'
import { generatePalette } from './utils/colorUtils'

const STORAGE_KEY = 'color-palette-history'
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

  useEffect(() => {
    saveHistory(history)
  }, [history])

  function handleGenerate() {
    setPalette(generatePalette(baseColor, harmony))
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
        <h1>Color Palette Generator</h1>
        <p>Pick a base color, choose a harmony, and generate 5 complementary colors.</p>
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
          <PaletteDisplay palette={palette} onSave={handleSave} />
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
