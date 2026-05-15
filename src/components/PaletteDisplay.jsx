import { useState } from 'react'
import { getContrastColor } from '../utils/colorUtils'

function ColorSwatch({ color }) {
  const [copied, setCopied] = useState(false)
  const textColor = getContrastColor(color.hex)

  function handleCopy() {
    navigator.clipboard.writeText(color.hex).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div
      className={`swatch ${color.isBase ? 'swatch--base' : ''}`}
      style={{ background: color.hex }}
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
      title="Click to copy hex"
    >
      <div className="swatch-labels" style={{ color: textColor }}>
        {color.label && (
          <span className="base-badge" style={{ borderColor: textColor, color: textColor }}>
            {color.label}
          </span>
        )}
        <span className="swatch-hex">{copied ? 'Copied!' : color.hex.toUpperCase()}</span>
        <span className="swatch-hsl">{color.info}</span>
      </div>
    </div>
  )
}

export default function PaletteDisplay({ palette, onSave }) {
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!palette || palette.length === 0) {
    return (
      <div className="palette-empty">
        <p>Pick a color and hit <strong>Generate Palette</strong> to get started.</p>
      </div>
    )
  }

  return (
    <div className="palette-display">
      <div className="swatches-row">
        {palette.map((color, i) => (
          <ColorSwatch key={i} color={color} />
        ))}
      </div>
      <div className="palette-footer">
        <p className="copy-hint">Click any swatch to copy its hex code</p>
        <button className={`save-btn ${saved ? 'save-btn--saved' : ''}`} onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save to History'}
        </button>
      </div>
    </div>
  )
}
