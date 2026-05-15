import { getContrastColor } from '../utils/colorUtils'

function MiniPalette({ entry, onClick, onDelete }) {
  return (
    <div className="history-entry">
      <button
        className="history-swatches"
        onClick={() => onClick(entry)}
        title="Restore this palette"
      >
        {entry.palette.map((color, i) => (
          <span
            key={i}
            className="mini-swatch"
            style={{ background: color.hex }}
          />
        ))}
        <span className="history-meta">
          <span className="history-base">{entry.baseColor.toUpperCase()}</span>
          <span className="history-harmony">{entry.harmony}</span>
          <span className="history-date">{new Date(entry.createdAt).toLocaleString()}</span>
        </span>
      </button>
      <button
        className="history-delete"
        onClick={() => onDelete(entry.id)}
        title="Delete this entry"
        aria-label="Delete palette entry"
      >
        ×
      </button>
    </div>
  )
}

export default function HistoryPanel({ history, onRestore, onDelete, onClear }) {
  if (history.length === 0) {
    return (
      <div className="history-panel">
        <h2>History</h2>
        <p className="history-empty">No palettes saved yet. Generate one to get started!</p>
      </div>
    )
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h2>History</h2>
        <button className="clear-btn" onClick={onClear}>Clear all</button>
      </div>
      <div className="history-list">
        {history.map((entry) => (
          <MiniPalette
            key={entry.id}
            entry={entry}
            onClick={onRestore}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
