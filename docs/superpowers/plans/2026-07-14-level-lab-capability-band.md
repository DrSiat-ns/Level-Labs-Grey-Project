# Level Lab Adaptive Capability Band Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the shared four-benefit capability rail into a full-width dark band with a centered adaptive grid that works beneath hero Versions A, B, and C.

**Architecture:** Keep the existing semantic HTML because the rail already sits outside the three hero panels and is therefore shared by every version. Update only the component CSS and its focused tests: the outer section breaks through the landing-page gutters, while the inner list retains the existing content width and changes from four columns to two and then one.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner, local Python preview server.

## Global Constraints

- Keep the existing four benefit titles, descriptions, and SVG icons unchanged.
- Keep one shared capability section outside the hero variants.
- Keep `Scroll to Learn More` centered above the band with visible separation.
- Use a full-width fixed dark surface in both themes with existing Level Lab core tokens.
- Use four equal columns above 900px, two columns from 561px through 900px, and one column at 560px and below.
- Preserve readable wrapping and prevent horizontal overflow at 320px.
- Do not add cards, shadows, gradients, animation, or JavaScript.
- Do not change hero media, CTAs, social proof, navigation, or later homepage sections.
- The prototype folder is not managed as a Git repository; omit commit commands.

---

### Task 1: Implement the Full-Width Adaptive Band

**Files:**
- Modify: `tests/site.test.mjs:176-191`
- Modify: `styles.css:441-540`

**Interfaces:**
- Consumes: Existing `.capability-rail`, `.capability-list`, `.capability-item`, `.capability-icon`, `.capability-title`, and `.capability-description` markup.
- Produces: A full-width fixed-dark rail whose inner list remains centered at `var(--width-content)` and retains the existing 4-to-2-to-1 responsive grid.

- [ ] **Step 1: Write the failing full-width and fixed-dark test**

Add this test after `the capability rail uses the approved responsive grid` in `tests/site.test.mjs`:

```js
test("the capability rail is full width with a centered fixed-dark inner grid", async () => {
  const css = await read("styles.css");

  assert.match(
    css,
    /\.capability-rail\s*\{[^}]*max-width:\s*none[^}]*margin-right:\s*calc\(-1 \* \(var\(--content-gap\) \+ var\(--safe-area-right\)\)\)[^}]*margin-left:\s*calc\(-1 \* \(var\(--content-gap\) \+ var\(--safe-area-left\)\)\)[^}]*background:\s*var\(--color-core-darkest\)/s,
  );
  assert.match(
    css,
    /\.capability-list\s*\{[^}]*width:\s*min\(calc\(100% - var\(--content-gap\) - var\(--content-gap\) - var\(--safe-area-left\) - var\(--safe-area-right\)\),\s*var\(--width-content\)\)[^}]*margin:\s*0 auto/s,
  );
  assert.match(css, /\.capability-item\s*\{[^}]*padding:\s*var\(--space-5\) clamp\(var\(--space-3\),\s*2vw,\s*var\(--space-4\)\)/s);
  assert.match(css, /\.capability-icon\s*\{[^}]*border:[^;]*var\(--color-core-dark\)[^}]*background:\s*var\(--color-core-darker\)[^}]*color:\s*var\(--color-accent-light\)/s);
  assert.match(css, /\.capability-title\s*\{[^}]*color:\s*var\(--color-core-lightest\)/s);
  assert.match(css, /\.capability-description\s*\{[^}]*color:\s*var\(--color-core-light\)/s);
});
```

Replace the first assertion in `the capability rail has breathing room below the hero without doubling mobile spacing` with:

```js
assert.match(css, /\.capability-rail\s*\{[^}]*margin-top:\s*var\(--space-4\)/s);
```

- [ ] **Step 2: Run the site test and verify it fails**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs
```

Expected: FAIL in `the capability rail is full width with a centered fixed-dark inner grid` because `.capability-rail` still has `max-width: var(--width-content)`.

- [ ] **Step 3: Replace the rail and inner-list framing rules**

Replace `.capability-rail` and update `.capability-list` in `styles.css` with:

```css
.capability-rail {
  width: auto;
  max-width: none;
  margin-top: var(--space-4);
  margin-right: calc(-1 * (var(--content-gap) + var(--safe-area-right)));
  margin-bottom: 0;
  margin-left: calc(-1 * (var(--content-gap) + var(--safe-area-left)));
  border-top: 1px solid var(--color-core-dark);
  border-bottom: 1px solid var(--color-core-dark);
  background: var(--color-core-darkest);
}

.capability-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: min(calc(100% - var(--content-gap) - var(--content-gap) - var(--safe-area-left) - var(--safe-area-right)), var(--width-content));
  margin: 0 auto;
  padding: 0;
  list-style: none;
}
```

- [ ] **Step 4: Tune the four benefit items and fixed-dark colors**

Update the existing component rules in `styles.css` to:

```css
.capability-item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  align-items: start;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-5) clamp(var(--space-3), 2vw, var(--space-4));
}

.capability-item + .capability-item {
  border-left: 1px solid var(--color-core-dark);
}

.capability-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-core-dark);
  border-radius: var(--radius-sm);
  background: var(--color-core-darker);
  color: var(--color-accent-light);
}

.capability-title {
  margin: 0;
  color: var(--color-core-lightest);
  font-size: 16px;
  line-height: 1.3;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
}

.capability-description {
  margin: var(--space-1) 0 0;
  color: var(--color-core-light);
  font-size: 16px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
```

In the existing 900px and 560px media queries, replace capability divider colors with `var(--color-core-dark)` while retaining the existing selectors and grid breakpoints:

```css
@media (max-width: 900px) {
  .capability-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .capability-item:nth-child(odd) {
    border-left: 0;
  }

  .capability-item:nth-child(n + 3) {
    border-top: 1px solid var(--color-core-dark);
  }
}

@media (max-width: 560px) {
  .capability-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .capability-item + .capability-item {
    border-top: 1px solid var(--color-core-dark);
    border-left: 0;
  }
}
```

- [ ] **Step 5: Run the complete test suite**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\*.test.mjs
```

Expected: 31 tests pass with zero failures.

---

### Task 2: Sync and Verify the Live Preview

**Files:**
- Copy: `styles.css` to `C:\Users\diann\Music\Level Lab Grey Project\styles.css`

**Interfaces:**
- Consumes: The tested capability-band CSS from Task 1.
- Produces: The updated local preview at `http://127.0.0.1:4173/index.html`.

- [ ] **Step 1: Sync the changed stylesheet**

Run:

```powershell
Copy-Item -LiteralPath 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\styles.css' -Destination 'C:\Users\diann\Music\Level Lab Grey Project\styles.css' -Force
```

- [ ] **Step 2: Verify the live server and stylesheet hash**

Run:

```powershell
$response = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/index.html?hero=a' -TimeoutSec 5
$response.StatusCode
Get-FileHash 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\styles.css','C:\Users\diann\Music\Level Lab Grey Project\styles.css'
```

Expected: HTTP `200` and matching SHA256 hashes.

- [ ] **Step 3: Inspect every hero version in the in-app browser**

Open and inspect:

```text
http://127.0.0.1:4173/index.html?hero=a
http://127.0.0.1:4173/index.html?hero=b
http://127.0.0.1:4173/index.html?hero=c
```

For each version, confirm the same dark band spans the viewport, the inner benefit grid remains centered, and the scroll cue has visible separation above it.

- [ ] **Step 4: Verify responsive and theme states**

Check `1051x898`, `768x900`, `375x812`, and `320x700`. Confirm the grid is four, two, one, and one columns respectively; the band reaches both viewport edges; all four items remain readable; and `document.documentElement.scrollWidth <= window.innerWidth`. Toggle light and dark themes and confirm the band colors remain fixed and readable.

- [ ] **Step 5: Run final verification**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\*.test.mjs
```

Expected: all 31 tests pass with zero failures after live-preview verification.
