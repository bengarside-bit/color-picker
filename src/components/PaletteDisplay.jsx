import { useState, Fragment } from 'react'
import { getContrastColor, hexToOklch, oklchToHex, oklchToString } from '../utils/colorUtils'

function midpointColor(hex1, hex2) {
  const a = hexToOklch(hex1)
  const b = hexToOklch(hex2)
  const l = (a.l + b.l) / 2
  const c = (a.c + b.c) / 2
  let diff = b.h - a.h
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  const h = ((a.h + diff / 2) % 360 + 360) % 360
  const hex = oklchToHex(l, c, h)
  return { hex, info: oklchToString(l, c, h), isBase: false, label: null }
}

function ColorSwatch({ color, onRemove, canRemove }) {
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
      {canRemove && (
        <button
          className="remove-btn"
          style={{ color: textColor, borderColor: textColor }}
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          title="Remove this color"
        >×</button>
      )}
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

export default function PaletteDisplay({ palette, onSave, onInsertColor, onRemoveColor }) {
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
          <Fragment key={i}>
            <ColorSwatch color={color} onRemove={() => onRemoveColor(i)} canRemove={palette.length > 1} />
            {i < palette.length - 1 && (
              <button
                className="insert-btn"
                onClick={() => onInsertColor(i + 1, midpointColor(color.hex, palette[i + 1].hex))}
                title="Add a color between these two"
              >+</button>
            )}
          </Fragment>
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
