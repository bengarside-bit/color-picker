import { useState, useRef, useEffect } from 'react'
import { searchColors } from '../data/colorDatabase'

const CATEGORY_LABELS = {
  brands: 'Brand',
  flowers: 'Flower',
  nature: 'Nature',
  food: 'Food',
  gems: 'Gem',
  space: 'Space',
  art: 'Art',
  fashion: 'Fashion',
}

export default function ColorSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    setActiveIndex(-1)
    const r = searchColors(q)
    setResults(r)
    setOpen(r.length > 0)
  }

  function handleSelect(color) {
    onSelect(color.hex, color.name)
    setQuery(color.name)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(results[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="color-search" ref={containerRef}>
      <div className="search-input-wrap">
        <SearchIcon />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search brands, nature, gems, space, art…"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button className="search-clear" onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus() }}>×</button>
        )}
      </div>

      {open && (
        <div className="search-dropdown">
          {results.map((color, i) => (
            <button
              key={color.hex + color.name}
              className={`search-result ${i === activeIndex ? 'search-result--active' : ''}`}
              onClick={() => handleSelect(color)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="result-swatch" style={{ background: color.hex }} />
              <span className="result-name">{color.name}</span>
              <span className="result-hex">{color.hex.toUpperCase()}</span>
              <span className="result-category">{CATEGORY_LABELS[color.category]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
