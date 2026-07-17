# Level Lab Capability Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact, responsive four-item capability rail between the homepage hero and Build section.

**Architecture:** Keep the existing static-site structure. Add one semantic HTML section shared by all hero variants, then add styles scoped to `.capability-rail` so no JavaScript or existing component behavior changes.

**Tech Stack:** Static HTML5, CSS custom properties and Grid, Node.js built-in test runner.

## Global Constraints

- Preserve the Level Lab design tokens and 5px spacing rhythm.
- Use the exact four titles and descriptions from the approved specification.
- Use local inline SVG icons with no package or network dependency.
- Keep Versions A, B, and C, hero switching, navigation, Build, and JavaScript unchanged.
- Support four columns on desktop, two columns on tablet, one column on phone, and no overflow at 320px.
- The Git CLI is unavailable in this workspace, so commit steps are omitted; verification and source/live hash matching provide the local prototype checkpoint.

---

### Task 1: Semantic Capability Rail

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `--width-content`, Level Lab color, border, radius, typography, and spacing tokens from the existing CSS imports.
- Produces: `<section class="capability-rail reveal" aria-label="Why Level Lab">` containing `.capability-list`, four `.capability-item` elements, and four `.capability-icon` elements.

- [ ] **Step 1: Write the failing semantic and placement test**

Add this test to `tests/site.test.mjs` after the hero presentation tests:

```js
test("the capability rail follows the hero with four approved benefits", async () => {
  const html = await read("index.html");
  const railMatch = html.match(
    /<section class="capability-rail reveal" aria-label="Why Level Lab">[\s\S]*?<\/section>/,
  );
  assert.ok(railMatch, "missing the Why Level Lab capability rail");

  const rail = railMatch[0];
  const approvedBenefits = [
    ["AI-assisted creation", "Describe what you want, and watch it appear."],
    ["No coding required", "Every tool works by pointing, dragging, and talking."],
    ["You stay in control", "Accept, tweak, or undo anything the AI suggests."],
    ["Publish and play", "Share your game with one click, right in the browser."],
  ];

  assert.equal(countMatches(rail, /<li class="capability-item">/g), 4);
  assert.equal(countMatches(rail, /<span class="capability-icon" aria-hidden="true">/g), 4);
  for (const [title, description] of approvedBenefits) {
    assert.ok(rail.includes(title), `missing capability title: ${title}`);
    assert.ok(rail.includes(description), `missing capability description: ${description}`);
  }

  const welcomeIndex = html.indexOf('id="welcome"');
  const railIndex = html.indexOf('class="capability-rail reveal"');
  const buildIndex = html.indexOf('id="build"');
  assert.ok(welcomeIndex < railIndex && railIndex < buildIndex, "capability rail must sit between Welcome and Build");
});
```

- [ ] **Step 2: Write the failing responsive-style test**

Add this test directly after the semantic rail test:

```js
test("the capability rail uses the approved responsive grid", async () => {
  const css = await read("styles.css");
  assert.match(css, /\.capability-list\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.capability-icon\s*\{[^}]*width:\s*40px[^}]*height:\s*40px/s);
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.capability-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?\.capability-list\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
});
```

- [ ] **Step 3: Run the tests and confirm the new behavior is missing**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs
```

Expected: the two new capability-rail tests fail because `index.html` and `styles.css` do not contain the rail yet; all existing tests pass.

- [ ] **Step 4: Add the semantic rail after the hero**

Insert this block between the closing `</section>` for `#welcome` and the opening `<section class="feature reveal" id="build" ...>` in `index.html`:

```html
<section class="capability-rail reveal" aria-label="Why Level Lab">
  <ul class="capability-list">
    <li class="capability-item">
      <span class="capability-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"></path>
          <path d="M5 3v4M3 5h4M19 17v4M17 19h4"></path>
        </svg>
      </span>
      <div class="capability-copy">
        <h2 class="capability-title">AI-assisted creation</h2>
        <p class="capability-description">Describe what you want, and watch it appear.</p>
      </div>
    </li>
    <li class="capability-item">
      <span class="capability-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"></path>
        </svg>
      </span>
      <div class="capability-copy">
        <h2 class="capability-title">No coding required</h2>
        <p class="capability-description">Every tool works by pointing, dragging, and talking.</p>
      </div>
    </li>
    <li class="capability-item">
      <span class="capability-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"></path>
        </svg>
      </span>
      <div class="capability-copy">
        <h2 class="capability-title">You stay in control</h2>
        <p class="capability-description">Accept, tweak, or undo anything the AI suggests.</p>
      </div>
    </li>
    <li class="capability-item">
      <span class="capability-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
      </span>
      <div class="capability-copy">
        <h2 class="capability-title">Publish and play</h2>
        <p class="capability-description">Share your game with one click, right in the browser.</p>
      </div>
    </li>
  </ul>
</section>
```

- [ ] **Step 5: Add the scoped Level Lab rail styles**

Add this block to `styles.css` after the hero styles and before the responsive rules:

```css
.capability-rail {
  width: 100%;
  max-width: var(--width-content);
  margin: 0 auto;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-background) 82%, transparent);
}

.capability-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.capability-item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  align-items: start;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-5) var(--space-4);
}

.capability-item + .capability-item {
  border-left: 1px solid var(--color-border);
}

.capability-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-accent-text);
}

.capability-icon svg {
  width: 20px;
  height: 20px;
}

.capability-copy {
  min-width: 0;
}

.capability-title {
  margin: 0;
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.3;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
}

.capability-description {
  margin: var(--space-1) 0 0;
  color: var(--color-text-dark);
  font-size: 16px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

@media (max-width: 900px) {
  .capability-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .capability-item:nth-child(odd) {
    border-left: 0;
  }

  .capability-item:nth-child(n + 3) {
    border-top: 1px solid var(--color-border);
  }
}

@media (max-width: 560px) {
  .capability-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .capability-item + .capability-item {
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }
}
```

- [ ] **Step 6: Run the complete automated suite**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs tests\hero-variants.test.mjs
```

Expected: all tests pass, including the two capability-rail tests.

---

### Task 2: Live Responsive Verification

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Copy verified files to: `C:\Users\diann\Music\Level Lab Grey Project`

**Interfaces:**
- Consumes: the completed rail from Task 1 and the existing local server at `http://127.0.0.1:4173/`.
- Produces: matching source/live HTML and CSS with a browser-verified rail.

- [ ] **Step 1: Sync the verified source files to the live preview folder**

Run with the required folder permission:

```powershell
Copy-Item -LiteralPath 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\index.html' -Destination 'C:\Users\diann\Music\Level Lab Grey Project\index.html' -Force
Copy-Item -LiteralPath 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\styles.css' -Destination 'C:\Users\diann\Music\Level Lab Grey Project\styles.css' -Force
```

Expected: both copy operations complete without errors.

- [ ] **Step 2: Verify the live URLs**

Request `index.html?hero=a`, `index.html?hero=b`, `index.html?hero=c`, and `styles.css` from port 4173.

Expected: every URL returns HTTP 200 and every hero version displays the same rail between the hero and Build.

- [ ] **Step 3: Inspect desktop and tablet layouts**

At 1051x898, confirm four equal columns, aligned icon squares, subtle vertical dividers, readable copy, and no overlap. At 768x900, confirm a two-by-two grid with the correct vertical and horizontal dividers.

- [ ] **Step 4: Inspect phone layout**

At 320x700, confirm one item per row, horizontal separators, no vertical dividers, no clipped text, and no horizontal overflow.

- [ ] **Step 5: Check both themes**

Confirm icons, borders, titles, descriptions, and the band remain readable in dark and light themes using existing semantic color tokens.

- [ ] **Step 6: Match source and live hashes**

Compare SHA-256 hashes for `index.html` and `styles.css` in the source and live folders.

Expected: both pairs match exactly.

