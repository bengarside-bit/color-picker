import { useState } from 'react'
import { getHarmonyTypes } from '../utils/colorUtils'
import ColorSearch from './ColorSearch'

const HARMONY_TYPES = getHarmonyTypes()
const supportsEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window

function EyeDropperIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22l4.5-4.5" />
      <path d="M13.5 2.5a2.12 2.12 0 013 3L6 16l-4 1 1-4L13.5 2.5z" />
      <path d="M15 5l3 3" />
    </svg>
  )
}

export default function ColorPicker({ baseColor, harmony, onColorChange, onHarmonyChange, onGenerate }) {
  const [inputValue, setInputValue] = useState(baseColor)
  const [dropping, setDropping] = useState(false)

  function handleHexInput(e) {
    const val = e.target.value
    setInputValue(val)
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      onColorChange(val)
    }
  }

  function handleNativeColorChange(e) {
    const val = e.target.value
    setInputValue(val)
    onColorChange(val)
  }

  function handleSearchSelect(hex) {
    setInputValue(hex)
    onColorChange(hex)
  }

  async function handleEyeDropper() {
    try {
      setDropping(true)
      const eyeDropper = new EyeDropper()
      const { sRGBHex } = await eyeDropper.open()
      setInputValue(sRGBHex)
      onColorChange(sRGBHex)
    } catch {
      // user cancelled
    } finally {
      setDropping(false)
    }
  }

  return (
    <div className="color-picker-panel">
      <h2>Choose Your Base Color</h2>

      <ColorSearch onSelect={handleSearchSelect} />

      <div className="picker-row">
        <label className="native-picker-label">
          <input
            type="color"
            value={baseColor}
            onChange={handleNativeColorChange}
            className="native-color-input"
          />
          <span>Pick color</span>
        </label>

        <div className="hex-input-wrap">
          <span className="hex-prefix">#</span>
          <input
            type="text"
            value={inputValue.replace('#', '')}
            maxLength={7}
            onChange={(e) => handleHexInput({ target: { value: '#' + e.target.value.replace(/#/g, '') } })}
            className="hex-text-input"
            placeholder="e.g. 3a7bd5"
            spellCheck={false}
          />
        </div>

        {supportsEyeDropper && (
          <button
            className={`eyedropper-btn ${dropping ? 'eyedropper-btn--active' : ''}`}
            onClick={handleEyeDropper}
            title="Pick color from screen"
          >
            <EyeDropperIcon />
          </button>
        )}

        <div className="base-swatch" style={{ background: baseColor }} aria-label={`Base color ${baseColor}`} />
      </div>

      <div className="harmony-section">
        <p className="section-label">Harmony Type</p>
        <div className="harmony-grid">
          {HARMONY_TYPES.map(({ key, label, description }) => (
            <button
              key={key}
              className={`harmony-btn ${harmony === key ? 'active' : ''}`}
              onClick={() => onHarmonyChange(key)}
              title={description}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button className="generate-btn" onClick={onGenerate}>
        Generate Palette
      </button>
    </div>
  )
}
