import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HindiFlashcards from "../hindi_flashcards.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HindiFlashcards />
  </StrictMode>
);
