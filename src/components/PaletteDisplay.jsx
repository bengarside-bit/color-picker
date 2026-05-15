import { useState, Fragment } from 'react'
import { getContrastColor, hexToOklch, oklchToHex, oklchToString } from '../utils/colorUtils'

function makeColor(hex) {
  const { l, c, h } = hexToOklch(hex)
  return { hex, info: oklchToString(l, c, h), isBase: false, label: null }
}

function midpointHex(hex1, hex2) {
  const a = hexToOklch(hex1)
  const b = hexToOklch(hex2)
  const l = (a.l + b.l) / 2
  const c = (a.c + b.c) / 2
  let diff = b.h - a.h
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  const h = ((a.h + diff / 2) % 360 + 360) % 360
  return oklchToHex(l, c, h)
}

function GenerateIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )
}

function ColorSwatch({ color, onRemove, canRemove, onUseAsBase, isDragging, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd }) {
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
      className={`swatch ${color.isBase ? 'swatch--base' : ''} ${isDragging ? 'swatch--dragging' : ''} ${isDragOver ? 'swatch--drag-over' : ''}`}
      style={{ background: color.hex }}
      draggable
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
      title="Click to copy · drag to reorder"
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDrop={(e) => { e.preventDefault(); onDrop() }}
      onDragEnd={onDragEnd}
    >
      <button
        className="use-as-base-btn"
        style={{ color: textColor, borderColor: textColor }}
        onClick={(e) => { e.stopPropagation(); onUseAsBase(color.hex) }}
        title="Generate palette from this color"
      >
        <GenerateIcon />
      </button>
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

export default function PaletteDisplay({ palette, onSave, onInsertColor, onRemoveColor, onUseAsBase, onReorderColors }) {
  const [saved, setSaved] = useState(false)
  const [insertPanel, setInsertPanel] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  function handleSave() {
    onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function openInsertPanel(index, hex1, hex2) {
    const hex = midpointHex(hex1, hex2)
    setInsertPanel({ index, hex, rawHex: hex.replace('#', '') })
  }

  function handleInsertConfirm() {
    onInsertColor(insertPanel.index, makeColor(insertPanel.hex))
    setInsertPanel(null)
  }

  function handleHexTextChange(val) {
    const raw = val.replace(/#/g, '').toUpperCase()
    const full = '#' + raw
    setInsertPanel((p) => ({
      ...p,
      rawHex: raw,
      hex: /^#[0-9A-F]{6}$/.test(full) ? full : p.hex,
    }))
  }

  function handleDrop(toIndex) {
    if (dragIndex !== null && dragIndex !== toIndex) {
      onReorderColors(dragIndex, toIndex)
    }
    setDragIndex(null)
    setDragOverIndex(null)
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
      <div className={`swatches-row ${dragIndex !== null ? 'swatches-row--dragging' : ''}`}>
        {palette.map((color, i) => (
          <Fragment key={i}>
            <ColorSwatch
              color={color}
              onRemove={() => onRemoveColor(i)}
              canRemove={palette.length > 1}
              onUseAsBase={onUseAsBase}
              isDragging={dragIndex === i}
              isDragOver={dragOverIndex === i && dragIndex !== i}
              onDragStart={() => setDragIndex(i)}
              onDragOver={() => setDragOverIndex(i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
            />
            {i < palette.length - 1 && (
              <button
                className={`insert-btn ${insertPanel?.index === i + 1 ? 'insert-btn--active' : ''}`}
                onClick={() =>
                  insertPanel?.index === i + 1
                    ? setInsertPanel(null)
                    : openInsertPanel(i + 1, color.hex, palette[i + 1].hex)
                }
                title="Add a color between these two"
              >+</button>
            )}
          </Fragment>
        ))}
      </div>

      {insertPanel && (
        <div className="insert-panel">
          <div className="insert-panel-preview" style={{ background: insertPanel.hex }} />
          <label className="insert-native-label" title="Pick a color">
            <input
              type="color"
              className="insert-native-input"
              value={insertPanel.hex}
              onChange={(e) => setInsertPanel((p) => ({ ...p, hex: e.target.value, rawHex: e.target.value.replace('#', '').toUpperCase() }))}
            />
          </label>
          <div className="insert-hex-wrap">
            <span className="hex-prefix">#</span>
            <input
              type="text"
              className="insert-hex-input"
              value={insertPanel.rawHex}
              maxLength={6}
              spellCheck={false}
              onChange={(e) => handleHexTextChange(e.target.value)}
            />
          </div>
          <button className="insert-confirm-btn" onClick={handleInsertConfirm}>Add</button>
          <button className="insert-cancel-btn" onClick={() => setInsertPanel(null)}>Cancel</button>
        </div>
      )}

      <div className="palette-footer">
        <p className="copy-hint">Click to copy · drag to reorder</p>
        <button className={`save-btn ${saved ? 'save-btn--saved' : ''}`} onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save to History'}
        </button>
      </div>
    </div>
  )
}
