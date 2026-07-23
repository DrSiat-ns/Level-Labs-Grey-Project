# Version D How Level Lab Works Panels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle Version D's existing three "How Level Lab Works" flip cards as 6px-cornered editorial panels without changing Versions A, B, or C.

**Architecture:** Keep the shared HTML and JavaScript untouched. Add a Version D-scoped CSS override layer using the existing active-hero selector, then protect the visual and interaction requirements with source-level regression assertions in the existing Node test suite.

**Tech Stack:** Static HTML, CSS custom properties and `:has()`, vanilla JavaScript, Node.js built-in test runner.

## Global Constraints

- Apply the new panel treatment only when `.hero-variant-d:not([hidden])` is active.
- Keep the existing three steps, front and back copy, section heading, DOM structure, click interaction, keyboard interaction, and `aria-pressed` updates unchanged.
- Use 6px panel corners, a slightly lighter dark surface, a thin Level Lab blue top edge, a large blue icon at top-left, and a compact step label at top-right.
- Use a 240ms transform flip and preserve reduced-motion behavior.
- Keep Versions A, B, and C visually unchanged.
- Do not add dependencies, imagery, decorative gradients, or heavy shadows.
- Do not create a Git commit; the user asked to leave repository operations alone for this prototype.

---

### Task 1: Add the Version D panel regression test

**Files:**
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: the Version D active selector `body:has(.hero-variant-d:not([hidden]))` and existing `.how-step` class structure.
- Produces: a test named `Version D uses editorial how-it-works panels without changing shared markup`.

- [ ] **Step 1: Add the failing regression test after the existing Version D shared-page test**

```js
test("Version D uses editorial how-it-works panels without changing shared markup", async () => {
  const html = await read("index.html");
  const css = await read("styles.css");
  const dSelector = String.raw`body:has\(\.hero-variant-d:not\(\[hidden\]\)\)`;

  assert.equal(countMatches(html, /class="how-step flip-card"/g), 3);
  assert.match(css, new RegExp(`${dSelector} \\.how-step \\.flip-face\\s*\\{[^}]*border-top:\\s*2px solid var\\(--color-accent\\)[^}]*border-radius:\\s*6px[^}]*background:\\s*color-mix\\(`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step \\.flip-card-inner\\s*\\{[^}]*transition:\\s*transform 240ms ease`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step-topline\\s*\\{[^}]*flex-direction:\\s*row-reverse`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step-icon\\s*\\{[^}]*width:\\s*52px[^}]*height:\\s*52px[^}]*color:\\s*var\\(--color-accent-light\\)`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step-number\\s*\\{[^}]*border-radius:\\s*6px[^}]*background:\\s*color-mix\\(`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step \\.flip-face-back \\.how-step-number\\s*\\{[^}]*position:\\s*absolute[^}]*top:\\s*32px[^}]*right:\\s*32px`, "s"));
});
```

- [ ] **Step 2: Run the focused test and verify it fails before CSS is added**

Run:

```powershell
node --test --test-name-pattern="Version D uses editorial" tests/site.test.mjs
```

Expected: `FAIL` because no Version D-specific How Level Lab Works panel selectors exist yet.

---

### Task 2: Add the Version D editorial panel treatment

**Files:**
- Modify: `styles.css` after the shared `.how-step-description` rule and before `.build-feature`.

**Interfaces:**
- Consumes: the existing `.how-step`, `.flip-card-inner`, `.flip-face`, `.how-step-topline`, `.how-step-number`, `.how-step-icon`, `.how-step-title`, and `.how-step-description` elements.
- Produces: Version D-only visual overrides; no new public classes or JavaScript behavior.

- [ ] **Step 1: Add the complete D-only styling block**

```css
/* Version D uses taller editorial step panels while preserving the shared flip-card markup. */
body:has(.hero-variant-d:not([hidden])) .how-step,
body:has(.hero-variant-d:not([hidden])) .how-step .flip-card-inner,
body:has(.hero-variant-d:not([hidden])) .how-step .flip-face {
  min-height: 300px;
}

body:has(.hero-variant-d:not([hidden])) .how-step .flip-card-inner {
  transition: transform 240ms ease;
}

body:has(.hero-variant-d:not([hidden])) .how-step .flip-face {
  padding: 32px;
  border-top: 2px solid var(--color-accent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--color-surface) 82%, var(--color-background));
}

body:has(.hero-variant-d:not([hidden])) .how-step-topline {
  flex-direction: row-reverse;
  align-items: flex-start;
  min-height: 52px;
}

body:has(.hero-variant-d:not([hidden])) .how-step-icon {
  width: 52px;
  height: 52px;
  color: var(--color-accent-light);
}

body:has(.hero-variant-d:not([hidden])) .how-step-icon svg {
  width: 44px;
  height: 44px;
}

body:has(.hero-variant-d:not([hidden])) .how-step-number {
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--color-accent) 22%, var(--color-surface));
  color: var(--color-accent-light);
}

body:has(.hero-variant-d:not([hidden])) .how-step-title {
  margin-top: 30px;
  font-size: 20px;
}

body:has(.hero-variant-d:not([hidden])) .how-step-description {
  max-width: 32ch;
}

body:has(.hero-variant-d:not([hidden])) .how-step .flip-face-back {
  align-items: flex-start;
  justify-content: center;
  padding-top: 72px;
}

body:has(.hero-variant-d:not([hidden])) .how-step .flip-face-back .how-step-number {
  position: absolute;
  top: 32px;
  right: 32px;
}

body:has(.hero-variant-d:not([hidden])) .how-step-back-copy {
  max-width: 30ch;
}

@media (hover: hover) {
  body:has(.hero-variant-d:not([hidden])) .how-step:hover .flip-face {
    background: color-mix(in srgb, var(--color-surface-light) 72%, var(--color-background));
  }
}
```

- [ ] **Step 2: Run the focused test and verify the Version D assertions pass**

Run:

```powershell
node --test --test-name-pattern="Version D uses editorial" tests/site.test.mjs
```

Expected: the focused test reports `PASS`.

- [ ] **Step 3: Run the full static test suite**

Run:

```powershell
node --test tests/site.test.mjs
```

Expected: all tests pass. If a pre-existing assertion fails because it references obsolete copy or an older shared card shape, confirm the failure exists before this change and report it without modifying A/B/C behavior.

---

### Task 3: Verify interaction, responsive behavior, and isolation

**Files:**
- Verify: `index.html?hero=d`
- Verify: `index.html?hero=a`
- Verify: `index.html?hero=b`
- Verify: `index.html?hero=c`

**Interfaces:**
- Consumes: the running local preview at `http://127.0.0.1:4173/`.
- Produces: visual confirmation that the approved design and isolation requirements hold.

- [ ] **Step 1: Inspect Version D at desktop size**

Open `http://127.0.0.1:4173/index.html?hero=d` at approximately `1440x900` and confirm:

```text
- Three equal-width panels are visible in one row.
- Every panel has subtle 6px corners and a thin blue top edge.
- The large blue line icon is top-left.
- The STEP label is top-right.
- Titles and descriptions remain left-aligned and unobscured.
```

- [ ] **Step 2: Verify all three flip cards by pointer and keyboard**

For each card, click once, press `Enter`, and press `Space`. Expected: the card alternates between the unchanged front and back copy, `aria-pressed` follows the state, and the layout does not jump.

- [ ] **Step 3: Verify the responsive stack**

At `768x900`, confirm the cards stack into one column and all icon, label, title, and description content remains inside each 6px-cornered panel with no horizontal overflow.

- [ ] **Step 4: Verify A/B/C isolation**

Open the A, B, and C URLs at desktop size. Expected: their How Level Lab Works cards retain the shared existing design with no blue top bar, no 52px icon override, and no 6px Version D panel treatment.

- [ ] **Step 5: Verify reduced-motion behavior**

Enable `prefers-reduced-motion: reduce`, flip a Version D card, and confirm the state still changes while the transition is effectively removed by the existing global reduced-motion rule.

