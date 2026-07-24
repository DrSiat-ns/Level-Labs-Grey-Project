# Version E Single-Line Hero Title Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the Version E hero headline on one desktop line while preserving readable wrapping on compact screens.

**Architecture:** Add one Version E-scoped desktop CSS rule for headline width and wrapping, followed by a compact-screen override. Extend the existing static-site assertions so Versions A through D remain unaffected.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner.

## Global Constraints

- Scope all new presentation behavior to Version E.
- Preserve the current Poppins typography, wording, colors, and spacing.
- Restore normal headline wrapping on compact screens.
- Do not introduce horizontal page overflow.

---

### Task 1: Version E Hero Headline

**Files:**
- Modify: `styles.css`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `.hero-variant-e`, `.hero-copy`, and `.hero-title` from the shared homepage markup.
- Produces: A desktop-only single-line Version E headline with a compact-screen wrapping fallback.

- [ ] **Step 1: Write the failing CSS assertion**

Add a test that checks for these Version E-scoped rules:

```js
assert.match(styles, /body:has\(\.hero-variant-e:not\(\[hidden\]\)\) \.hero-variant-e \.hero-copy\s*\{[^}]*width:\s*min\(calc\(100% - 40px\),\s*1100px\)/s);
assert.match(styles, /body:has\(\.hero-variant-e:not\(\[hidden\]\)\) \.hero-variant-e \.hero-title\s*\{[^}]*white-space:\s*nowrap/s);
assert.match(styles, /@media \(max-width:\s*900px\)[\s\S]*body:has\(\.hero-variant-e:not\(\[hidden\]\)\) \.hero-variant-e \.hero-title\s*\{[^}]*white-space:\s*normal/s);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/site.test.mjs
```

Expected: the new Version E single-line assertion fails before the CSS rule exists.

- [ ] **Step 3: Add the Version E desktop and compact-screen rules**

Add to `styles.css` after the existing Version E typography rules:

```css
body:has(.hero-variant-e:not([hidden])) .hero-variant-e .hero-copy {
  width: min(calc(100% - 40px), 1100px);
}

body:has(.hero-variant-e:not([hidden])) .hero-variant-e .hero-title {
  white-space: nowrap;
}

@media (max-width: 900px) {
  body:has(.hero-variant-e:not([hidden])) .hero-variant-e .hero-copy {
    width: min(100% - 40px, 820px);
  }

  body:has(.hero-variant-e:not([hidden])) .hero-variant-e .hero-title {
    white-space: normal;
  }
}
```

- [ ] **Step 4: Run verification**

Run the test suite and open `http://127.0.0.1:4173/index.html?hero=e`.

Expected: the Version E title is one line on desktop, wraps below 900px, and the page has no horizontal overflow.

- [ ] **Step 5: Commit when Git is available**

```powershell
git add styles.css tests/site.test.mjs docs/superpowers/specs/2026-07-23-version-e-single-line-hero-title-design.md docs/superpowers/plans/2026-07-23-version-e-single-line-hero-title.md
git commit -m "style: keep version e hero title on one line"
```
