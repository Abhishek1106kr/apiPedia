# APIPEDIA UX Writing Guidelines

This guide establishes the rules for writing interface copy, tooltips, toasts, button labels, error states, and keyboard shortcuts on the APIPEDIA platform. 

Our UX writing is optimized for high-density, command-line-inspired interfaces. We value speed, density, and clarity.

---

## 1. Style & Casing Conventions

We use distinct casing styles depending on the semantic weight of the UI element.

### Mono Uppercase Labels
Used for structural field names, metrics, status badges, and terminal-like indicators.
* **Examples**: `RATELIMIT`, `LATENCY`, `STATUS: HEALTHY`, `AUTH: BEARER`, `SDK: TS/JS`
* **Format**: All caps, monospace font (`Geist Mono`). No punctuation.

### Sentence Case
Used for page titles, headings, card descriptions, input placeholders, error messages, and body copy. We do not use Title Case (except for brand names).
* **Correct**: *"Compare latency across regional endpoints"*
* **Incorrect**: *"Compare Latency Across Regional Endpoints"*

### Button Labels
Buttons should always start with an action verb. Keep them short—ideally one to two words.
* **Correct**: `Copy code`, `Send request`, `Compare APIs`, `Add key`
* **Incorrect**: `Click here to copy`, `Make API request`, `Start comparing`

---

## 2. Error and Success States

Developers read error messages to solve problems. Never write vague, unhelpful error copy.

### The Error Message Framework
An error message must explain:
1. **What happened**: Plain technical description.
2. **Why it happened**: Root cause (if known).
3. **How to fix it**: Clear, actionable path forward.

* **Correct**: *"Authentication failed: Invalid API key format. Ensure your bearer token starts with `ap_live_`."*
* **Incorrect**: *"An error occurred while authenticating. Please try again later."*

### Success Toasts
Keep success messages brief and confirm the action immediately.
* **Correct**: *"API key copied to clipboard."* (Temporary toast, auto-dismiss in 2000ms)
* **Incorrect**: *"Successfully completed the action of copying the API key."*

---

## 3. Tooltips & Keyboard Shortcuts

APIPEDIA is keyboard-first. Tooltips should explain the control's function and display its shortcut if one exists.

### Tooltip Format
* Keep tooltips under 80 characters.
* Use a single active sentence starting with an action verb.
* Append the keyboard shortcut in brackets if available.

* **Examples**:
  * *"Copy OpenAPI specification to clipboard. `[C]`"*
  * *"Compare selected APIs in the matrix. `[Cmd+K]`"*
  * *"Toggle playground execution panel. `[P]`"*

### Keyboard Shortcut Labels
When displaying keyboard shortcuts, use the standard abbreviations:
* Use `Cmd` on macOS and `Ctrl` on Windows/Linux.
* Use `Shift`, `Alt`, / `Option`, `Enter`, `Esc`, `Space`.
* Separate multiple keys with a `+` symbol (e.g., `Cmd+Shift+K`).

---

## 4. Empty and Loading States

Empty and loading states should prevent confusion and feel responsive.

### Empty States
When a search returns no results or a comparison matrix is empty, the empty state must:
1. Explain why the space is empty.
2. Suggest an action or alternative search.
3. Keep the developer in their flow.

* **Example (No search results)**:
  * Title: *"No APIs match 'payment'"*
  * Subtitle: *"Try searching for 'stripe', 'paypal', or check our custom recipes catalog."*

### Loading States
Instead of a generic spinner, use context-aware skeleton loaders and terminal-like loading indicators that reflect the active task.
* **Example**: *"Pinging regional endpoints..."* or *"Parsing OpenAPI schema..."*
