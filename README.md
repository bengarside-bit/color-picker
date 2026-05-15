# Color Palette Generator

A React app that generates 5-color palettes from a single base color using color theory harmonies. Palette history is saved in your browser's localStorage.

---

## Prerequisites

You need **Node.js** (v18+) and **pnpm** installed.

### 1 — Install Node.js

Go to https://nodejs.org and download the LTS installer for macOS, or use a version manager:

```bash
# Using Homebrew (recommended)
brew install node

# Or using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install --lts
```

### 2 — Install pnpm

```bash
npm install -g pnpm
```

---

## Getting Started

```bash
# Navigate to the project folder
cd color-palette

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open **http://localhost:5173** in your browser.

---

## How It Works

1. **Pick a base color** — use the color picker or type a hex code directly.
2. **Choose a harmony type** — five color theory modes are available:
   - **Analogous** — colors adjacent on the wheel (cohesive, calm)
   - **Complementary** — base + its opposite (high contrast)
   - **Triadic** — three equally spaced colors (vibrant, balanced)
   - **Split-Complementary** — base + two colors flanking its complement (softer contrast)
   - **Tetradic** — four colors forming a rectangle on the wheel (rich, complex)
3. **Click Generate Palette** — five swatches appear.
4. **Click any swatch** to copy its hex code to the clipboard.
5. **History** — every generated palette is saved automatically. Click an entry to restore it, or delete entries individually / clear all.

---

## Project Structure

```
color-palette/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx          # React entry point
    ├── App.jsx           # Root component + localStorage logic
    ├── index.css         # Global styles
    ├── components/
    │   ├── ColorPicker.jsx    # Base color input + harmony selector
    │   ├── PaletteDisplay.jsx # 5-swatch palette view
    │   └── HistoryPanel.jsx   # Saved palette history
    └── utils/
        └── colorUtils.js      # hex↔HSL conversion + palette generation
```

---

## Other Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start local dev server at http://localhost:5173 |
| `pnpm build` | Build for production (output in `dist/`) |
| `pnpm preview` | Preview the production build locally |
