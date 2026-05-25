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

## Build a standalone HTML file

```bash
npm run build
```

Produces a single self-contained `dist/index.html` with all JavaScript inlined. Open it directly in any browser — no server needed. The API key is **not** included in the build and the + Add word button is hidden automatically.
