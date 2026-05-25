# Hindi Flashcards

## Setup

Install dependencies (once):
```bash
npm install
```

Add your Anthropic API key to `.env`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

## Run locally (dev mode)

```bash
npm run dev
```

Opens at `http://localhost:5173`. The **+ Add word** button uses the Claude API to generate entries.

## Build a standalone static site

```bash
npm run build
```

Produces a self-contained `dist/` folder. The API key is **not** included in the build — the + Add word button is hidden automatically. Serve the folder with any static host or open `dist/index.html` directly in a browser.
