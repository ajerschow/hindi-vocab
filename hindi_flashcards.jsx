import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import DEFAULT_COLLECTION from "./data/default_collection.json";

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const DEFAULT_UNITS = DEFAULT_COLLECTION.units;
const DEFAULT_WORDS = DEFAULT_COLLECTION.words;

const API_KEY_CONFIGURED = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

// ─── STORAGE ─────────────────────────────────────────────────────────────────
// Use storage if available (Claude Code preview), otherwise localStorage.
const storage = window.storage ?? {
  get: (key) => Promise.resolve({ value: localStorage.getItem(key) }),
  set: (key, value) => { localStorage.setItem(key, value); return Promise.resolve(); },
};

// ─── UTILITY ─────────────────────────────────────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const CATEGORY_LABELS = { noun: "Noun", verb: "Verb", other: "Expression" };
const CATEGORY_COLORS = {
  noun:  { bg: "#e8f4fd", accent: "#1a6fa8", badge: "#d0eaf8" },
  verb:  { bg: "#fdf3e8", accent: "#b45309", badge: "#fde8c8" },
  other: { bg: "#f0fdf4", accent: "#15803d", badge: "#dcfce7" },
};


// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function Badge({ children, style }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      padding: "3px 8px",
      borderRadius: "4px",
      ...style,
    }}>{children}</span>
  );
}

function ProgressBar({ current, total }) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
        <span>{current} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#6366f1", borderRadius: "2px", transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

function FlashCard({ word, showBack, onFlip, onEdit, onRemove, allUnits }) {
  const col = CATEGORY_COLORS[word.category];
  const units = allUnits || DEFAULT_UNITS;
  return (
    <div
      onClick={onFlip}
      style={{
        background: "#fff",
        border: `2px solid ${col.accent}22`,
        borderRadius: "20px",
        padding: "36px 32px 28px",
        minHeight: "340px",
        cursor: "pointer",
        userSelect: "none",
        position: "relative",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)"; }}
    >
      {/* Action menu — edit / remove */}
      {(onEdit || onRemove) && (
        <WordMenu onEdit={onEdit} onRemove={onRemove} />
      )}

      {/* top badges */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
        {word.id?.startsWith("custom_") && (
          <Badge style={{ background: "#fdf4ff", color: "#7e22ce" }}>✦ My word</Badge>
        )}
        {word.unit && (
          <Badge style={{ background: "#e0e7ff", color: "#4338ca" }}>
            {units.find(u => u.id === word.unit)?.label.split("—")[0].trim() ?? word.unit}
          </Badge>
        )}
        <Badge style={{ background: col.badge, color: col.accent }}>
          {CATEGORY_LABELS[word.category]}
        </Badge>
        {word.gender && (
          <Badge style={{ background: word.gender === "f" ? "#fce7f3" : word.gender === "m" ? "#eff6ff" : "#f5f3ff", color: word.gender === "f" ? "#9d174d" : word.gender === "m" ? "#1e40af" : "#5b21b6" }}>
            {word.gender === "m" ? "♂ masc." : word.gender === "f" ? "♀ fem." : "⚥ m/f"}
          </Badge>
        )}
        {word.transitive !== null && word.transitive !== undefined && (
          <Badge style={{ background: word.transitive ? "#fef9c3" : "#ecfdf5", color: word.transitive ? "#713f12" : "#064e3b" }}>
            {word.transitive ? "transitive (-ne)" : "intransitive"}
          </Badge>
        )}
      </div>

      {/* FRONT */}
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "52px", fontFamily: "serif", lineHeight: 1.2, marginBottom: "8px", color: "#1e293b" }}>
          {word.devanagari}
        </div>
        <div style={{ fontSize: "20px", color: "#64748b", fontStyle: "italic", marginBottom: "4px" }}>
          {word.transliteration}
        </div>

        {/* BACK */}
        {showBack && (
          <div style={{ marginTop: "20px", width: "100%", borderTop: `1px solid ${col.accent}22`, paddingTop: "20px" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, color: col.accent, marginBottom: "16px" }}>
              {word.meaning}
            </div>
            <div style={{ textAlign: "left" }}>
              {word.examples.map((ex, i) => (
                <div key={i} style={{ background: col.bg, borderRadius: "10px", padding: "10px 14px", marginBottom: "8px" }}>
                  <div style={{ fontSize: "16px", fontFamily: "serif", color: "#1e293b", marginBottom: "2px" }}>{ex.sentence}</div>
                  <div style={{ fontSize: "13px", fontStyle: "italic", color: "#64748b", marginBottom: "2px" }}>{ex.transliteration}</div>
                  <div style={{ fontSize: "13px", color: "#475569" }}>{ex.translation}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* tap hint */}
      {!showBack && (
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px", marginTop: "16px" }}>
          tap to reveal →
        </div>
      )}
    </div>
  );
}

// ─── WORD MENU (⋮ dots on card) ──────────────────────────────────────────────
function WordMenu({ onEdit, onRemove }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "absolute", top: "14px", right: "14px", zIndex: 10 }}
      onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8", padding: "4px 8px", borderRadius: "8px", lineHeight: 1 }}
        title="Options"
      >⋮</button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", right: 0, top: "32px", background: "#fff",
            borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            minWidth: "140px", overflow: "hidden", zIndex: 10,
            border: "1px solid #e2e8f0",
          }}>
            {onEdit && (
              <button onClick={() => { setOpen(false); onEdit(); }} style={{
                display: "block", width: "100%", padding: "10px 16px", border: "none",
                background: "none", cursor: "pointer", textAlign: "left", fontSize: "14px",
                color: "#1e293b", fontWeight: 500,
              }}>✏️ Edit entry</button>
            )}
            {onRemove && (
              <button onClick={() => { setOpen(false); onRemove(); }} style={{
                display: "block", width: "100%", padding: "10px 16px", border: "none",
                background: "none", cursor: "pointer", textAlign: "left", fontSize: "14px",
                color: "#dc2626", fontWeight: 500,
              }}>🗑 Remove from deck</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── EDIT WORD PANEL ──────────────────────────────────────────────────────────
function EditWordPanel({ word, onSave, onClose, allUnits }) {
  const units = allUnits || DEFAULT_UNITS;
  const [form, setForm] = useState({
    devanagari: word.devanagari || "",
    transliteration: word.transliteration || "",
    meaning: word.meaning || "",
    category: word.category || "other",
    gender: word.gender || "",
    transitive: word.transitive === true ? "true" : word.transitive === false ? "false" : "",
    unit: word.unit || "",
    examples: word.examples?.length ? word.examples : [
      { sentence: "", transliteration: "", translation: "" },
      { sentence: "", transliteration: "", translation: "" },
    ],
  });

  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");

  const openAI = () => {
    const promptFn = DEFAULT_PROMPTS[form.category] || DEFAULT_PROMPTS.other;
    setAiPrompt(promptFn({ ...word, ...form }));
    setAiStatus("idle");
    setAiResult(null);
    setAiError("");
    setShowAI(true);
  };

  const generateAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiStatus("loading");
    setAiResult(null);
    setAiError("");
    const systemPrompt = `You are a Hindi language expert. Generate one example sentence for the word "${form.devanagari}" (${form.meaning}).
Focus: ${aiPrompt}

Return ONLY a JSON object with exactly these fields:
{
  "sentence": "the Hindi sentence in Devanagari",
  "transliteration": "IAST romanisation of the sentence",
  "translation": "English translation with tense noted in parentheses e.g. (past) or (present)"
}
No markdown, no backticks, no explanation.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          messages: [{ role: "user", content: systemPrompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      setAiResult(JSON.parse(raw.replace(/```json|```/g, "").trim()));
      setAiStatus("done");
    } catch {
      setAiError("Couldn't generate an example. Try again.");
      setAiStatus("error");
    }
  };

  const addAIResult = () => {
    if (!aiResult) return;
    setForm(f => ({ ...f, examples: [...f.examples, aiResult] }));
    setAiResult(null);
    setAiStatus("idle");
    setShowAI(false);
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setExample = (i, k, v) => setForm(f => {
    const exs = f.examples.map((ex, idx) => idx === i ? { ...ex, [k]: v } : ex);
    return { ...f, examples: exs };
  });
  const addExample = () => setForm(f => ({ ...f, examples: [...f.examples, { sentence: "", transliteration: "", translation: "" }] }));
  const removeExample = (i) => setForm(f => ({ ...f, examples: f.examples.filter((_, idx) => idx !== i) }));

  const handleSave = () => {
    const updated = {
      ...word,
      devanagari: form.devanagari.trim(),
      transliteration: form.transliteration.trim(),
      meaning: form.meaning.trim(),
      category: form.category,
      gender: form.category === "noun" ? (form.gender || null) : null,
      transitive: form.category === "verb"
        ? (form.transitive === "true" ? true : form.transitive === "false" ? false : null)
        : null,
      unit: form.unit || null,
      examples: form.examples.filter(ex => ex.sentence.trim()),
    };
    onSave(updated);
  };

  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: "8px",
    border: "1.5px solid #e2e8f0", fontSize: "14px", boxSizing: "border-box",
    outline: "none", color: "#1e293b", background: "#fafafa",
  };
  const labelStyle = { fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px", display: "block" };
  const fieldStyle = { marginBottom: "14px" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "28px 24px", width: "100%",
        maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>✏️ Edit Entry</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>×</button>
        </div>

        {/* Core fields */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Devanagari</label>
          <input value={form.devanagari} onChange={e => setField("devanagari", e.target.value)}
            style={{ ...inputStyle, fontSize: "22px", fontFamily: "serif" }} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Transliteration</label>
          <input value={form.transliteration} onChange={e => setField("transliteration", e.target.value)} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Meaning</label>
          <input value={form.meaning} onChange={e => setField("meaning", e.target.value)} style={inputStyle} />
        </div>

        {/* Category + gender/transitivity */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e => setField("category", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="other">Other / Expression</option>
            </select>
          </div>
          {form.category === "noun" && (
            <div>
              <label style={labelStyle}>Gender</label>
              <select value={form.gender} onChange={e => setField("gender", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">— unset —</option>
                <option value="m">♂ Masculine</option>
                <option value="f">♀ Feminine</option>
                <option value="m/f">⚥ Both</option>
              </select>
            </div>
          )}
          {form.category === "verb" && (
            <div>
              <label style={labelStyle}>Transitivity</label>
              <select value={form.transitive} onChange={e => setField("transitive", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">— unset —</option>
                <option value="true">Transitive (ने)</option>
                <option value="false">Intransitive</option>
              </select>
            </div>
          )}
        </div>

        {/* Deck assignment */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Deck</label>
          <select value={form.unit} onChange={e => setField("unit", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">— No deck —</option>
            {units.map(u => (
              <option key={u.id} value={u.id}>{u.label.split("—")[0].trim()}</option>
            ))}
          </select>
        </div>

        {/* Examples */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ ...labelStyle, margin: 0 }}>Example sentences</label>
            <div style={{ display: "flex", gap: "6px" }}>
              {API_KEY_CONFIGURED && (
                <button onClick={showAI ? () => setShowAI(false) : openAI} style={{
                  background: showAI ? "#ede9fe" : "#f5f3ff", border: "none", borderRadius: "6px", padding: "3px 10px",
                  cursor: "pointer", fontSize: "12px", color: "#7c3aed", fontWeight: 600,
                }}>✦ AI</button>
              )}
              <button onClick={addExample} style={{
                background: "#f1f5f9", border: "none", borderRadius: "6px", padding: "3px 10px",
                cursor: "pointer", fontSize: "12px", color: "#475569", fontWeight: 600,
              }}>+ Add</button>
            </div>
          </div>

          {/* Inline AI generator */}
          {showAI && (
            <div style={{ background: "#faf5ff", border: "1.5px solid #ddd6fe", borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#7c3aed", marginBottom: "5px", display: "block" }}>
                Focus prompt (edit to customise)
              </label>
              <textarea
                value={aiPrompt}
                onChange={e => { setAiPrompt(e.target.value); setAiStatus("idle"); setAiResult(null); }}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5, marginBottom: "8px", background: "#fff" }}
              />
              <button
                onClick={generateAI}
                disabled={aiStatus === "loading" || !aiPrompt.trim()}
                style={{
                  width: "100%", padding: "8px", borderRadius: "8px", border: "none",
                  background: aiStatus === "loading" || !aiPrompt.trim() ? "#e2e8f0" : "#7c3aed",
                  color: aiStatus === "loading" || !aiPrompt.trim() ? "#94a3b8" : "#fff",
                  cursor: aiStatus === "loading" || !aiPrompt.trim() ? "default" : "pointer",
                  fontWeight: 700, fontSize: "13px", marginBottom: aiResult || aiStatus === "error" ? "8px" : 0,
                }}
              >
                {aiStatus === "loading" ? "Generating…" : "Generate"}
              </button>
              {aiStatus === "error" && (
                <div style={{ fontSize: "12px", color: "#dc2626", padding: "4px 0" }}>{aiError}</div>
              )}
              {aiResult && (
                <div style={{ background: "#fff", borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", border: "1px solid #ddd6fe" }}>
                  <div style={{ fontSize: "15px", fontFamily: "serif", color: "#1e293b", marginBottom: "2px" }}>{aiResult.sentence}</div>
                  <div style={{ fontSize: "12px", fontStyle: "italic", color: "#64748b", marginBottom: "2px" }}>{aiResult.transliteration}</div>
                  <div style={{ fontSize: "12px", color: "#475569", marginBottom: "8px" }}>{aiResult.translation}</div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => { setAiResult(null); setAiStatus("idle"); }} style={{
                      flex: 1, padding: "5px", borderRadius: "6px", border: "1.5px solid #e2e8f0",
                      background: "#fff", cursor: "pointer", fontSize: "12px", color: "#475569", fontWeight: 600,
                    }}>Discard</button>
                    <button onClick={addAIResult} style={{
                      flex: 2, padding: "5px", borderRadius: "6px", border: "none",
                      background: "#7c3aed", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 700,
                    }}>+ Add to list</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {form.examples.map((ex, i) => (
            <div key={i} style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Example {i + 1}</span>
                {form.examples.length > 1 && (
                  <button onClick={() => removeExample(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", fontSize: "14px" }}>✕</button>
                )}
              </div>
              <input placeholder="Hindi sentence (Devanagari)…" value={ex.sentence}
                onChange={e => setExample(i, "sentence", e.target.value)}
                style={{ ...inputStyle, fontFamily: "serif", fontSize: "15px", marginBottom: "6px" }} />
              <input placeholder="Transliteration…" value={ex.transliteration}
                onChange={e => setExample(i, "transliteration", e.target.value)}
                style={{ ...inputStyle, fontStyle: "italic", marginBottom: "6px" }} />
              <input placeholder="English translation…" value={ex.translation}
                onChange={e => setExample(i, "translation", e.target.value)}
                style={inputStyle} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
            background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px", color: "#475569",
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            flex: 2, padding: "11px", borderRadius: "10px", border: "none",
            background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "14px",
          }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD WORD PANEL ───────────────────────────────────────────────────────────
function AddWordPanel({ onAdd, onClose }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [preview, setPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const generate = async () => {
    const word = input.trim();
    if (!word) return;
    setStatus("loading");
    setPreview(null);
    setErrorMsg("");

    const prompt = `You are a Hindi language expert. The user has entered a Hindi word or phrase: "${word}"

Analyse it and return a JSON object with these exact fields:
- "devanagari": the word in Devanagari script (correct it if needed)
- "transliteration": IAST-style romanisation
- "meaning": concise English meaning (include all main senses, separated by " / ")
- "category": one of "noun", "verb", or "other" (use "other" for adjectives, pronouns, particles, expressions)
- "gender": for nouns only — "m", "f", or "m/f". Omit (null) for verbs and other.
- "transitive": for verbs only — true if transitive, false if intransitive, null if mixed/auxiliary. Omit (null) for nouns and other.
- "unit": null (leave null, the user can assign a chapter later)
- "examples": array of exactly 2 objects, each with:
    - "sentence": a natural Hindi example sentence in Devanagari using this word
    - "transliteration": romanised version of that sentence
    - "translation": English translation, noting tense in parentheses e.g. "(past)" or "(present)"

Return ONLY the raw JSON object. No markdown, no backticks, no explanation.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      // Assign a unique id
      parsed.id = "custom_" + Date.now();
      setPreview(parsed);
      setStatus("done");
    } catch (e) {
      setErrorMsg("Couldn't generate the entry. Please check the word and try again.");
      setStatus("error");
    }
  };

  const col = preview ? CATEGORY_COLORS[preview.category] || CATEGORY_COLORS.other : CATEGORY_COLORS.other;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "28px 24px", width: "100%", maxWidth: "500px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>✨ Add a Word</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>×</button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            value={input}
            onChange={e => { setInput(e.target.value); setStatus("idle"); setPreview(null); }}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="Type a Hindi word (e.g. किताब or kitāb)…"
            style={{
              flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
              fontSize: "16px", fontFamily: "serif, system-ui", outline: "none", color: "#1e293b",
            }}
            autoFocus
          />
          <button onClick={generate} disabled={status === "loading" || !input.trim()} style={{
            padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer",
            background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: "14px",
            opacity: status === "loading" || !input.trim() ? 0.5 : 1,
          }}>
            {status === "loading" ? "…" : "Generate"}
          </button>
        </div>

        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "24px", color: "#6366f1", fontSize: "14px" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>⟳</div>
            Analysing word with AI…
          </div>
        )}

        {status === "error" && (
          <div style={{ background: "#fef2f2", borderRadius: "10px", padding: "14px", color: "#b91c1c", fontSize: "14px" }}>
            {errorMsg}
          </div>
        )}

        {preview && status === "done" && (
          <div>
            <div style={{ background: col.bg, borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
              {/* Badges */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                <Badge style={{ background: col.badge, color: col.accent }}>{CATEGORY_LABELS[preview.category] || preview.category}</Badge>
                {preview.gender && (
                  <Badge style={{ background: preview.gender === "f" ? "#fce7f3" : "#eff6ff", color: preview.gender === "f" ? "#9d174d" : "#1e40af" }}>
                    {preview.gender === "m" ? "♂ masc." : preview.gender === "f" ? "♀ fem." : "⚥ m/f"}
                  </Badge>
                )}
                {preview.transitive === true && <Badge style={{ background: "#fef9c3", color: "#713f12" }}>transitive (-ne)</Badge>}
                {preview.transitive === false && <Badge style={{ background: "#ecfdf5", color: "#064e3b" }}>intransitive</Badge>}
              </div>
              {/* Word */}
              <div style={{ fontSize: "42px", fontFamily: "serif", color: "#1e293b", lineHeight: 1.2 }}>{preview.devanagari}</div>
              <div style={{ fontSize: "17px", fontStyle: "italic", color: "#64748b", marginBottom: "10px" }}>{preview.transliteration}</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: col.accent, marginBottom: "14px" }}>{preview.meaning}</div>
              {/* Examples */}
              {preview.examples?.map((ex, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "8px", padding: "10px 12px", marginBottom: "6px" }}>
                  <div style={{ fontSize: "15px", fontFamily: "serif", color: "#1e293b", marginBottom: "2px" }}>{ex.sentence}</div>
                  <div style={{ fontSize: "12px", fontStyle: "italic", color: "#64748b", marginBottom: "2px" }}>{ex.transliteration}</div>
                  <div style={{ fontSize: "12px", color: "#475569" }}>{ex.translation}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setPreview(null); setStatus("idle"); }} style={{
                flex: 1, padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
                background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px", color: "#475569",
              }}>Regenerate</button>
              <button onClick={() => { onAdd(preview); onClose(); }} style={{
                flex: 2, padding: "10px", borderRadius: "10px", border: "none",
                background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "14px",
              }}>+ Add to deck</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const DEFAULT_PROMPTS = {
  noun: (w) =>
    `Show "${w.devanagari}" used in its ${w.gender === "f" ? "feminine" : w.gender === "m" ? "masculine" : "gender"} form. Include either an oblique case, a plural, or a genitive construction (X का/की/के) so the gender inflection is visible.`,
  verb: (w) =>
    w.transitive
      ? `Show "${w.devanagari}" in the perfect tense using the ने construction (transitive past).`
      : `Show "${w.devanagari}" in the simple past tense (intransitive).`,
  other: (w) =>
    `Show "${w.devanagari}" used naturally in a short conversational sentence.`,
};

// ─── MANAGE DECKS PANEL ───────────────────────────────────────────────────────
function ManageDecksPanel({ allUnits, allWords, onRename, onCreate, onDelete, onClose }) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const wordCount = (unitId) => allWords.filter(w => w.unit === unitId).length;

  const startEdit = (u) => { setEditingId(u.id); setEditingLabel(u.label.split("—")[0].trim()); };
  const saveEdit = () => {
    if (editingLabel.trim()) onRename(editingId, editingLabel.trim());
    setEditingId(null);
  };
  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName("");
  };

  const inputStyle = {
    padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #e2e8f0",
    fontSize: "14px", outline: "none", color: "#1e293b", background: "#fafafa",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "28px 24px", width: "100%", maxWidth: "480px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>Manage Decks</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>×</button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          {allUnits.map(u => {
            const count = wordCount(u.id);
            const isEditing = editingId === u.id;
            const isConfirming = confirmDelete === u.id;
            return (
              <div key={u.id} style={{
                padding: "10px 12px", borderRadius: "10px", marginBottom: "6px",
                background: "#f8fafc", border: "1.5px solid #e2e8f0",
              }}>
                {isConfirming ? (
                  <div>
                    <div style={{ fontSize: "13px", color: "#ef4444", marginBottom: "8px", fontWeight: 600 }}>
                      Delete "{u.label.split("—")[0].trim()}"?
                      {count > 0 ? ` ${count} word${count !== 1 ? "s" : ""} will become unassigned.` : ""}
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => { onDelete(u.id); setConfirmDelete(null); }} style={{
                        padding: "5px 14px", borderRadius: "7px", border: "none",
                        background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      }}>Delete</button>
                      <button onClick={() => setConfirmDelete(null)} style={{
                        padding: "5px 14px", borderRadius: "7px", border: "1.5px solid #e2e8f0",
                        background: "#fff", cursor: "pointer", fontSize: "13px", color: "#475569",
                      }}>Cancel</button>
                    </div>
                  </div>
                ) : isEditing ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      value={editingLabel}
                      onChange={e => setEditingLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                      style={{ ...inputStyle, flex: 1 }}
                      autoFocus
                    />
                    <button onClick={saveEdit} style={{
                      padding: "6px 14px", borderRadius: "7px", border: "none",
                      background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                    }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{
                      padding: "6px 10px", borderRadius: "7px", border: "1.5px solid #e2e8f0",
                      background: "#fff", cursor: "pointer", fontSize: "13px", color: "#475569",
                    }}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ flex: 1, fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
                      {u.label.split("—")[0].trim()}
                      {u.label.includes("—") && (
                        <span style={{ fontWeight: 400, color: "#94a3b8" }}> — {u.label.split("—").slice(1).join("—").trim()}</span>
                      )}
                    </span>
                    <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {count} word{count !== 1 ? "s" : ""}
                    </span>
                    {u.isBuiltIn && (
                      <span style={{ fontSize: "10px", color: "#cbd5e1", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>built-in</span>
                    )}
                    <button onClick={() => startEdit(u)} style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: "13px",
                      color: "#94a3b8", padding: "2px 6px", borderRadius: "4px",
                    }} title="Rename">✏️</button>
                    {!u.isBuiltIn && (
                      <button onClick={() => setConfirmDelete(u.id)} style={{
                        background: "none", border: "none", cursor: "pointer", fontSize: "13px",
                        color: "#f87171", padding: "2px 6px", borderRadius: "4px",
                      }} title="Delete deck">🗑</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", marginBottom: "8px" }}>Create a new deck</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="Deck name…"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={handleCreate} disabled={!newName.trim()} style={{
              padding: "7px 18px", borderRadius: "8px", border: "none",
              background: newName.trim() ? "#6366f1" : "#e2e8f0",
              color: newName.trim() ? "#fff" : "#94a3b8",
              cursor: newName.trim() ? "pointer" : "default",
              fontWeight: 700, fontSize: "14px",
            }}>+ Create</button>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <button onClick={onClose} style={{
            padding: "9px 20px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
            background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px", color: "#475569",
          }}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function HindiFlashcards() {
  const [filter, setFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [customWords, setCustomWords] = useState([]);
  const [removedIds, setRemovedIds] = useState(new Set());
  const [overrides, setOverrides] = useState({});
  const [customUnits, setCustomUnits] = useState([]);
  const [unitLabels, setUnitLabels] = useState({});
  const [loadedCollection, setLoadedCollection] = useState(null); // null = use defaults
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showManageDecks, setShowManageDecks] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const importInputRef = useRef(null);

  // Load all persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const [cw, ri, ov, cu, ul, lc] = await Promise.allSettled([
          storage.get("custom_words"),
          storage.get("removed_ids"),
          storage.get("word_overrides"),
          storage.get("custom_units"),
          storage.get("unit_labels"),
          storage.get("loaded_collection"),
        ]);
        if (cw.status === "fulfilled" && cw.value?.value)
          setCustomWords(JSON.parse(cw.value.value));
        if (ri.status === "fulfilled" && ri.value?.value)
          setRemovedIds(new Set(JSON.parse(ri.value.value)));
        if (ov.status === "fulfilled" && ov.value?.value)
          setOverrides(JSON.parse(ov.value.value));
        if (cu.status === "fulfilled" && cu.value?.value)
          setCustomUnits(JSON.parse(cu.value.value));
        if (ul.status === "fulfilled" && ul.value?.value)
          setUnitLabels(JSON.parse(ul.value.value));
        if (lc.status === "fulfilled" && lc.value?.value)
          setLoadedCollection(JSON.parse(lc.value.value));
      } finally {
        setStorageReady(true);
      }
    })();
  }, []);

  const baseWords = useMemo(() => loadedCollection ? loadedCollection.words : DEFAULT_WORDS, [loadedCollection]);
  const baseUnits = useMemo(() => loadedCollection ? loadedCollection.units : DEFAULT_UNITS, [loadedCollection]);

  const allWords = useMemo(() => {
    return [...baseWords, ...customWords]
      .filter(w => !removedIds.has(w.id))
      .map(w => overrides[w.id] ? { ...w, ...overrides[w.id] } : w);
  }, [baseWords, customWords, removedIds, overrides]);

  const allUnits = useMemo(() => [
    ...baseUnits.map(u => ({ ...u, label: unitLabels[u.id] ?? u.label, isBuiltIn: true })),
    ...customUnits.map(u => ({ ...u, isBuiltIn: false })),
  ], [baseUnits, customUnits, unitLabels]);

  const clearCollectionState = async () => {
    setCustomWords([]); setRemovedIds(new Set()); setOverrides({});
    setCustomUnits([]); setUnitLabels({}); setFilter("all"); setUnitFilter("all");
    try {
      await Promise.all([
        storage.set("custom_words", "[]"),
        storage.set("removed_ids", "[]"),
        storage.set("word_overrides", "{}"),
        storage.set("custom_units", "[]"),
        storage.set("unit_labels", "{}"),
      ]);
    } catch (_) {}
  };

  const importCollection = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data.words)) throw new Error("Missing words array");
        const col = { name: data.name || "Imported Collection", units: data.units || [], words: data.words };
        setLoadedCollection(col);
        await clearCollectionState();
        try { await storage.set("loaded_collection", JSON.stringify(col)); } catch (_) {}
      } catch {
        alert("Could not load collection — make sure it is a valid JSON file exported from this app.");
      }
    };
    reader.readAsText(file);
  };

  const resetToDefault = async () => {
    setLoadedCollection(null);
    await clearCollectionState();
    try { await storage.set("loaded_collection", ""); } catch (_) {}
  };

  const exportCollection = () => {
    const col = {
      version: 1,
      name: loadedCollection?.name ?? DEFAULT_COLLECTION.name,
      exportedAt: new Date().toISOString(),
      units: allUnits.map(({ id, label }) => ({ id, label })),
      words: allWords,
    };
    const blob = new Blob([JSON.stringify(col, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${col.name.toLowerCase().replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renameUnit = async (id, label) => {
    if (baseUnits.some(u => u.id === id)) {
      const updated = { ...unitLabels, [id]: label };
      setUnitLabels(updated);
      try { await storage.set("unit_labels", JSON.stringify(updated)); } catch (_) {}
    } else {
      const updated = customUnits.map(u => u.id === id ? { ...u, label } : u);
      setCustomUnits(updated);
      try { await storage.set("custom_units", JSON.stringify(updated)); } catch (_) {}
    }
  };

  const createUnit = async (label) => {
    const id = "cu_" + Date.now();
    const updated = [...customUnits, { id, label }];
    setCustomUnits(updated);
    try { await storage.set("custom_units", JSON.stringify(updated)); } catch (_) {}
  };

  const deleteUnit = async (id) => {
    const updatedUnits = customUnits.filter(u => u.id !== id);
    setCustomUnits(updatedUnits);
    try { await storage.set("custom_units", JSON.stringify(updatedUnits)); } catch (_) {}

    const updatedWords = customWords.map(w => w.unit === id ? { ...w, unit: null } : w);
    setCustomWords(updatedWords);
    try { await storage.set("custom_words", JSON.stringify(updatedWords)); } catch (_) {}

    const updatedOverrides = Object.fromEntries(
      Object.entries(overrides).map(([wid, ov]) => [wid, ov.unit === id ? { ...ov, unit: null } : ov])
    );
    setOverrides(updatedOverrides);
    try { await storage.set("word_overrides", JSON.stringify(updatedOverrides)); } catch (_) {}

    if (unitFilter === id) setUnitFilter("all");
  };

  const [deck, setDeck] = useState(() => shuffle(DEFAULT_WORDS));
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [learning, setLearning] = useState(new Set());
  const [view, setView] = useState("cards"); // "cards" | "list"
  const [searchQ, setSearchQ] = useState("");

  const filtered = useMemo(() => {
    let base = allWords;
    if (unitFilter !== "all") {
      base = base.filter(w => w.unit === unitFilter);
    } else if (filter !== "all") {
      base = base.filter(w => w.category === filter);
    }
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      base = base.filter(w =>
        w.devanagari.includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q)
      );
    }
    return base;
  }, [allWords, filter, unitFilter, searchQ]);

  const prevFilteredIdsRef = useRef(null);
  useEffect(() => {
    const ids = filtered.map(w => w.id).join("\0");
    if (prevFilteredIdsRef.current === ids) {
      // Same cards, only data changed (e.g. a save) — update in place, keep position
      setDeck(prev => prev.map(w => filtered.find(f => f.id === w.id) ?? w));
      return;
    }
    prevFilteredIdsRef.current = ids;
    setDeck(shuffle(filtered));
    setIndex(0);
    setShowBack(false);
  }, [filtered]);

  const current = deck[index];
  const handleFlip = () => setShowBack(v => !v);

  const nav = useCallback((dir) => {
    setShowBack(false);
    setIndex(i => {
      const n = i + dir;
      if (n < 0) return deck.length - 1;
      if (n >= deck.length) return 0;
      return n;
    });
  }, [deck.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") nav(1);
      if (e.key === "ArrowLeft") nav(-1);
      if (e.key === " ") { e.preventDefault(); handleFlip(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nav]);

  const [editingWord, setEditingWord] = useState(null);

  const removeWord = async (word) => {
    if (word.id.startsWith("custom_")) {
      // Remove from customWords
      const updated = customWords.filter(w => w.id !== word.id);
      setCustomWords(updated);
      try { await storage.set("custom_words", JSON.stringify(updated)); } catch (_) {}
    } else {
      // Hide a built-in word via a "removed" set persisted in storage
      const updated = [...removedIds, word.id];
      setRemovedIds(new Set(updated));
      try { await storage.set("removed_ids", JSON.stringify(updated)); } catch (_) {}
    }
    // Advance deck if we just removed the current card
    setDeck(prev => {
      const next = prev.filter(w => w.id !== word.id);
      setIndex(i => Math.min(i, Math.max(0, next.length - 1)));
      return next;
    });
  };

  const saveEdit = async (updated) => {
    if (updated.id.startsWith("custom_")) {
      const newList = customWords.map(w => w.id === updated.id ? updated : w);
      setCustomWords(newList);
      try { await storage.set("custom_words", JSON.stringify(newList)); } catch (_) {}
    } else {
      // Store overrides for built-in words
      const newOverrides = { ...overrides, [updated.id]: updated };
      setOverrides(newOverrides);
      try { await storage.set("word_overrides", JSON.stringify(newOverrides)); } catch (_) {}
    }
    setEditingWord(null);
  };

  const markKnown = () => {
    setKnown(s => { const n = new Set(s); n.add(current.id); return n; });
    setLearning(s => { const n = new Set(s); n.delete(current.id); return n; });
    nav(1);
  };
  const markLearning = () => {
    setLearning(s => { const n = new Set(s); n.add(current.id); return n; });
    setKnown(s => { const n = new Set(s); n.delete(current.id); return n; });
    nav(1);
  };

  const stats = {
    total: filtered.length,
    known: [...known].filter(id => filtered.some(w => w.id === id)).length,
    learning: [...learning].filter(id => filtered.some(w => w.id === id)).length,
    grandTotal: allWords.length,
  };

  if (!storageReady) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: "680px", margin: "40px auto", padding: "16px", textAlign: "center", color: "#94a3b8" }}>
        Loading your words…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: "680px", margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0, color: "#1e293b" }}>हिंदी</h1>
          <span style={{ fontSize: "16px", color: "#64748b" }}>Hindi Flashcards</span>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>({stats.grandTotal} words)</span>
        </div>
        <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#94a3b8" }}>
          <span>✓ {stats.known} known</span>
          <span>↺ {stats.learning} learning</span>
          <span>◎ {stats.total - stats.known - stats.learning} unseen</span>
          {unitFilter !== "all" && <span style={{ color: "#6366f1", fontWeight: 600 }}>● {allUnits.find(u => u.id === unitFilter)?.label}</span>}
        </div>
      </div>

      {/* Collection bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          📚 {loadedCollection?.name ?? DEFAULT_COLLECTION.name}
        </span>
        <span style={{ fontSize: "12px", color: "#cbd5e1" }}>·</span>
        <button onClick={exportCollection} style={{
          background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#6366f1", fontWeight: 600, padding: "0",
        }}>↑ Export</button>
        <span style={{ fontSize: "12px", color: "#cbd5e1" }}>·</span>
        <button onClick={() => importInputRef.current?.click()} style={{
          background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#6366f1", fontWeight: 600, padding: "0",
        }}>↓ Import</button>
        {loadedCollection && (
          <>
            <span style={{ fontSize: "12px", color: "#cbd5e1" }}>·</span>
            <button onClick={resetToDefault} style={{
              background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#94a3b8", fontWeight: 600, padding: "0",
            }}>↺ Reset to default</button>
          </>
        )}
        <input ref={importInputRef} type="file" accept=".json" style={{ display: "none" }}
          onChange={e => { if (e.target.files[0]) importCollection(e.target.files[0]); e.target.value = ""; }} />
      </div>

      {/* Category filter row */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        {[
          { key: "all", label: `All (${baseWords.length})` },
          { key: "noun", label: `Nouns` },
          { key: "verb", label: `Verbs` },
          { key: "other", label: `Expressions` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setFilter(key); setUnitFilter("all"); }} style={{
            padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
            background: unitFilter === "all" && filter === key ? "#6366f1" : "#f1f5f9",
            color: unitFilter === "all" && filter === key ? "#fff" : "#475569",
            transition: "all 0.15s",
          }}>{label}</button>
        ))}
        <button onClick={() => setView(v => v === "cards" ? "list" : "cards")} style={{
          marginLeft: "auto", padding: "6px 14px", borderRadius: "20px", border: "1.5px solid #e2e8f0",
          background: "#fff", cursor: "pointer", fontSize: "13px", color: "#475569", fontWeight: 600,
        }}>
          {view === "cards" ? "≡ List" : "⊟ Cards"}
        </button>
        {API_KEY_CONFIGURED && (
          <button onClick={() => setShowAddPanel(true)} style={{
            padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
            background: "#6366f1", color: "#fff",
          }}>
            + Add word
          </button>
        )}
      </div>

      {/* Unit filter row */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
        <button onClick={() => setUnitFilter("all")} style={{
          padding: "4px 12px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600,
          background: unitFilter === "all" ? "#e0e7ff" : "#f8fafc",
          color: unitFilter === "all" ? "#4338ca" : "#94a3b8",
        }}>All decks</button>
        {allUnits.map(u => {
          const short = u.label.split("—")[0].trim();
          const display = short.length > 14 ? short.slice(0, 12) + "…" : short;
          return (
            <button key={u.id} onClick={() => { setUnitFilter(u.id); setFilter("all"); }} style={{
              padding: "4px 12px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              background: unitFilter === u.id ? "#6366f1" : "#f8fafc",
              color: unitFilter === u.id ? "#fff" : "#64748b",
              transition: "all 0.15s",
            }}>{display}</button>
          );
        })}
        <button onClick={() => setShowManageDecks(true)} style={{
          marginLeft: "auto", padding: "4px 10px", borderRadius: "20px", border: "1.5px solid #e2e8f0",
          background: "#fff", cursor: "pointer", fontSize: "12px", color: "#64748b", fontWeight: 600,
        }} title="Manage decks">⚙ Manage</button>
      </div>

      {/* Search */}
      <input
        value={searchQ}
        onChange={e => setSearchQ(e.target.value)}
        placeholder="Search Devanagari, transliteration, or meaning…"
        style={{
          width: "100%", padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
          fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", outline: "none",
          background: "#fafafa", color: "#1e293b",
        }}
      />

      {view === "cards" && current ? (
        <>
          <ProgressBar current={index + 1} total={deck.length} />
          <FlashCard
            word={current}
            showBack={showBack}
            onFlip={handleFlip}
            onEdit={() => setEditingWord(current)}
            onRemove={() => removeWord(current)}
            allUnits={allUnits}
          />

          {/* Navigation */}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", alignItems: "center", justifyContent: "center" }}>
            <button onClick={() => nav(-1)} style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}>← Prev</button>
            <button onClick={markLearning} style={{ ...btnStyle, background: "#fef9c3", color: "#713f12" }}>↺ Learning</button>
            <button onClick={markKnown} style={{ ...btnStyle, background: "#dcfce7", color: "#14532d" }}>✓ Know it</button>
            <button onClick={() => nav(1)} style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}>Next →</button>
          </div>
          <div style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
            Space = flip · ← → = navigate
          </div>
        </>
      ) : view === "list" ? (
        <div>
          {filtered.map(word => {
            const col = CATEGORY_COLORS[word.category];
            const isKnown = known.has(word.id);
            const isLearning = learning.has(word.id);
            return (
              <div key={word.id} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "8px 12px",
                padding: "10px 14px", borderRadius: "10px", marginBottom: "6px",
                background: isKnown ? "#f0fdf4" : isLearning ? "#fffbeb" : "#fafafa",
                border: `1px solid ${isKnown ? "#bbf7d0" : isLearning ? "#fde68a" : "#e2e8f0"}`,
                alignItems: "center", fontSize: "14px",
              }}>
                <div>
                  <span style={{ fontSize: "20px", fontFamily: "serif", marginRight: "6px" }}>{word.devanagari}</span>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>{word.transliteration}</span>
                </div>
                <div style={{ color: "#475569" }}>{word.meaning}</div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center" }}>
                  {word.id?.startsWith("custom_") && (
                    <Badge style={{ background: "#fdf4ff", color: "#7e22ce" }}>✦ My word</Badge>
                  )}
                  <Badge style={{ background: col.badge, color: col.accent }}>{CATEGORY_LABELS[word.category]}</Badge>
                  {word.gender && <Badge style={{ background: "#eff6ff", color: "#1e40af" }}>{word.gender}</Badge>}
                  {word.transitive === true && <Badge style={{ background: "#fef9c3", color: "#713f12" }}>trans.</Badge>}
                  {word.transitive === false && <Badge style={{ background: "#ecfdf5", color: "#064e3b" }}>intrans.</Badge>}
                  <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                    <button onClick={e => { e.stopPropagation(); setEditingWord(word); }} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#94a3b8", fontSize: "14px", padding: "2px 6px", borderRadius: "4px",
                    }} title="Edit">✏️</button>
                    <button onClick={e => { e.stopPropagation(); removeWord(word); }} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#f87171", fontSize: "14px", padding: "2px 6px", borderRadius: "4px",
                    }} title="Remove from deck">🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No words found.</div>
      )}

      {/* Reshuffle */}
      {view === "cards" && (
        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <button onClick={() => { setDeck(shuffle(filtered)); setIndex(0); setShowBack(false); }} style={{
            background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#94a3b8", textDecoration: "underline",
          }}>
            Reshuffle deck
          </button>
        </div>
      )}

      {/* Add Word Panel */}
      {showAddPanel && (
        <AddWordPanel
          onAdd={async word => {
            const updated = [...customWords, word];
            setCustomWords(updated);
            try {
              await storage.set("custom_words", JSON.stringify(updated));
            } catch (e) {
              console.error("Storage save failed:", e);
            }
          }}
          onClose={() => setShowAddPanel(false)}
        />
      )}

      {/* Edit Word Panel */}
      {editingWord && (
        <EditWordPanel
          word={editingWord}
          onSave={saveEdit}
          onClose={() => setEditingWord(null)}
          allUnits={allUnits}
        />
      )}

      {/* Manage Decks Panel */}
      {showManageDecks && (
        <ManageDecksPanel
          allUnits={allUnits}
          allWords={allWords}
          onRename={renameUnit}
          onCreate={createUnit}
          onDelete={deleteUnit}
          onClose={() => setShowManageDecks(false)}
        />
      )}
    </div>
  );
}

const btnStyle = {
  padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
  fontSize: "13px", fontWeight: 600, transition: "opacity 0.15s",
};
