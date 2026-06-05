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
They are hidden automatically in any build where the key is absent.

## Build a standalone HTML file

```bash
npm run build
```

Produces a single self-contained `dist/index.html` with all JavaScript and the default deck inlined.  
Open it directly in any browser — no server needed.  
The API key is **not** included and the AI buttons are hidden automatically.

## Deploy to GitHub

### 1. Create a GitHub repository

On GitHub, create a new empty repo (no README, no .gitignore — the project already has both).

### 2. Push the code

```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

The `.env` file is gitignored and will never be pushed.

### 3. Enable GitHub Pages

In your repo go to **Settings → Pages** and set **Source** to **GitHub Actions**.

That's it. Every push to `main` triggers `.github/workflows/deploy.yml`, which:

1. Installs dependencies (`npm ci`)
2. Runs `npm run build` — **without** the API key, so the built file is safe to serve publicly
3. Deploys `dist/index.html` to GitHub Pages

The live URL will appear in the Actions run and in **Settings → Pages** once the first deploy completes.

### API key & the "+ Add word" button

| Context | Key available | AI buttons |
|---|---|---|
| `npm run dev` (local) | ✅ via `.env` | Visible |
| `npm run build` (local) | ✅ via `.env` | **Not** baked in — button hidden |
| GitHub Pages (CI build) | ❌ intentionally absent | Hidden |

The built HTML never contains the key regardless of how it is built.  
If you want the AI features locally on the static file, run the dev server instead.
