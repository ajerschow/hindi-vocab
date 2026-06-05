# Hindi Flashcards

## Local development

Install dependencies (once):
```bash
npm install
```

Add your Anthropic API key to `.env` (never committed — already in `.gitignore`):
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Start the dev server:
```bash
npm run dev
```

Opens at `http://localhost:5173`.  
The **+ Add word** and **AI bulk import** buttons use the Claude API to generate entries.

## Build a standalone HTML file (with API key)

```bash
npm run build
```

Produces a single self-contained `dist/index.html`. The API key from `.env` is baked
in, so AI features work when opened directly in a browser.

## Deploy to GitHub Pages

```bash
npm run deploy
```

This does two things in one step:

1. **Builds** the app with `VITE_ANTHROPIC_API_KEY` explicitly cleared — the key is
   never baked into the deployed file even if `.env` is present locally.
2. **Pushes** `dist/index.html` to the `gh-pages` branch on GitHub.

The AI buttons are hidden automatically in the deployed version.

### First-time setup

After the first `npm run deploy`, go to  
**github.com/ajerschow/hindi-vocab → Settings → Pages**  
and set **Source → Deploy from a branch**, branch **`gh-pages`**, folder **`/ (root)`**.

The site will be live at `https://ajerschow.github.io/hindi-vocab/`.

---

| Context | API key in output | AI buttons |
|---|---|---|
| `npm run dev` | never (runtime only) | Visible |
| `npm run build` | ✅ from `.env` | Visible |
| `npm run deploy` | ❌ explicitly cleared | Hidden |
