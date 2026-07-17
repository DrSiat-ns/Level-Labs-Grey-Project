# Level Lab Hero Social Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five fictional creator avatars and the prototype copy `879 creators active this week` beneath the CTA buttons in all three homepage hero versions.

**Architecture:** Keep the feature static and local. Each hero variant receives the same semantic social-proof block, all five avatars are standalone local SVG assets, and shared CSS controls layout, themes, and narrow-screen wrapping without JavaScript.

**Tech Stack:** Static HTML, CSS, local SVG assets, Node.js built-in test runner.

## Global Constraints

- Place the social proof directly beneath the CTA row in Versions A, B, and C.
- Use exactly five fictional 28px creator avatars with an 8px overlap.
- Use the exact prototype copy `879 creators active this week`, with `879` bold.
- Keep the component unframed: no pill, card, shadow, glow, or gradient.
- Use Level Lab theme tokens and the success token for the activity dot.
- Version B must retain fixed light foreground colors over its video scrim.
- The component must not cause horizontal overflow at 320px.
- The folder is not a Git repository; omit commit commands.

---

### Task 1: Add Creator Assets and Social-Proof Markup

**Files:**
- Create: `assets/images/creator-avatar-1.svg`
- Create: `assets/images/creator-avatar-2.svg`
- Create: `assets/images/creator-avatar-3.svg`
- Create: `assets/images/creator-avatar-4.svg`
- Create: `assets/images/creator-avatar-5.svg`
- Modify: `index.html:44-83`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: Existing `.hero-copy` and `.hero-actions` blocks in hero panels A, B, and C.
- Produces: One `.hero-proof` block per panel and five local SVG paths consumed by `<img class="hero-proof-avatar">`.

- [ ] **Step 1: Write the failing content test**

Add this test after `all hero versions use the approved Welcome message` in `tests/site.test.mjs`:

```js
test("all hero versions show the approved prototype creator activity", async () => {
  const html = await read("index.html");
  const avatarPaths = Array.from(
    { length: 5 },
    (_, index) => `assets/images/creator-avatar-${index + 1}.svg`,
  );

  for (const { version, block } of getHeroPanelBlocks(html)) {
    const proofMatch = block.match(/<div class="hero-proof">[\s\S]*?<\/div>\s*<\/div>/);
    assert.ok(proofMatch, `hero panel ${version} must include creator activity`);
    const proof = proofMatch[0];
    assert.equal(countMatches(proof, /class="hero-proof-avatar"/g), 5);
    assert.match(proof, /<strong>879<\/strong> creators active this week/);
    assert.match(proof, /class="hero-proof-status" aria-hidden="true"/);
    for (const avatarPath of avatarPaths) {
      assert.ok(proof.includes(`src="${avatarPath}"`), `hero panel ${version} is missing ${avatarPath}`);
    }
  }

  for (const avatarPath of avatarPaths) {
    const asset = await read(avatarPath);
    assert.match(asset, /<svg\b/);
  }
});
```

- [ ] **Step 2: Run the content test and verify it fails**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs
```

Expected: FAIL with `hero panel a must include creator activity`.

- [ ] **Step 3: Create the five local avatar assets**

Create `assets/images/creator-avatar-1.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="14" fill="#3a3a3a"/>
  <circle cx="14" cy="10" r="5" fill="#e5e5e5"/>
  <path d="M5 28c.8-6.7 4-10 9-10s8.2 3.3 9 10" fill="#0077ff"/>
  <path d="M9 8c1-4 9-5 10 1-3-1-6-1-10-1Z" fill="#1a1a1a"/>
</svg>
```

Create `assets/images/creator-avatar-2.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="14" fill="#252525"/>
  <circle cx="14" cy="10.5" r="5" fill="#dadada"/>
  <path d="M4.5 28c1-6.5 4.3-9.7 9.5-9.7s8.5 3.2 9.5 9.7" fill="#00ccdd"/>
  <path d="M8.5 10c0-5.5 11-6.2 11 0-2.2-1.7-8.8-1.7-11 0Z" fill="#8c8c8c"/>
</svg>
```

Create `assets/images/creator-avatar-3.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="14" fill="#3a3a3a"/>
  <circle cx="14" cy="10" r="5" fill="#c5c5c5"/>
  <path d="M5 28c.7-6.4 3.7-9.6 9-9.6s8.3 3.2 9 9.6" fill="#bb44ff"/>
  <path d="m8 8 2-4 3 2 3-3 4 5c-3-1-8.5-1-12 0Z" fill="#1a1a1a"/>
</svg>
```

Create `assets/images/creator-avatar-4.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="14" fill="#252525"/>
  <circle cx="14" cy="10.5" r="5" fill="#e5e5e5"/>
  <path d="M4.5 28c.8-6.5 4-9.8 9.5-9.8s8.7 3.3 9.5 9.8" fill="#ffcc00"/>
  <path d="M9 7.5c1.7-4.2 8.6-4.2 10.3 0L18 10c-2.8-1.2-5.5-1.2-8 0Z" fill="#8c8c8c"/>
</svg>
```

Create `assets/images/creator-avatar-5.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="14" fill="#3a3a3a"/>
  <circle cx="14" cy="10" r="5" fill="#dadada"/>
  <path d="M5 28c.8-6.6 3.8-9.9 9-9.9s8.2 3.3 9 9.9" fill="#ff3366"/>
  <path d="M8.5 9.5c0-6.5 11-6.5 11 0l-2-1.2-2 1.2-2-1.2-2 1.2-3-1.5Z" fill="#1a1a1a"/>
</svg>
```

- [ ] **Step 4: Add the exact social-proof block to every hero version**

Insert this block immediately after each `.hero-actions` closing tag in hero panels A, B, and C:

```html
<div class="hero-proof">
  <span class="hero-proof-avatars" aria-hidden="true">
    <img class="hero-proof-avatar" src="assets/images/creator-avatar-1.svg" alt="" width="28" height="28">
    <img class="hero-proof-avatar" src="assets/images/creator-avatar-2.svg" alt="" width="28" height="28">
    <img class="hero-proof-avatar" src="assets/images/creator-avatar-3.svg" alt="" width="28" height="28">
    <img class="hero-proof-avatar" src="assets/images/creator-avatar-4.svg" alt="" width="28" height="28">
    <img class="hero-proof-avatar" src="assets/images/creator-avatar-5.svg" alt="" width="28" height="28">
  </span>
  <span class="hero-proof-copy"><strong>879</strong> creators active this week</span>
  <span class="hero-proof-status" aria-hidden="true"></span>
</div>
```

- [ ] **Step 5: Run the content test and verify it passes**

Run the Step 2 command again.

Expected: the new creator-activity test passes; CSS-related tests remain unchanged.

---

### Task 2: Style the Social-Proof Component

**Files:**
- Modify: `styles.css:223-250`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `.hero-proof`, `.hero-proof-avatars`, `.hero-proof-avatar`, `.hero-proof-copy`, and `.hero-proof-status` from Task 1.
- Produces: A centered desktop row, fixed Version B foreground colors, and wrapping behavior below 480px.

- [ ] **Step 1: Write the failing layout test**

Add this test after the content test:

```js
test("hero creator activity uses the approved layout and responsive behavior", async () => {
  const css = await read("styles.css");
  assert.match(css, /\.hero-proof\s*\{[^}]*display:\s*flex[^}]*margin-top:\s*var\(--space-3\)[^}]*font-size:\s*14px/s);
  assert.match(css, /\.hero-proof-avatar\s*\{[^}]*width:\s*28px[^}]*height:\s*28px[^}]*border-radius:\s*50%/s);
  assert.match(css, /\.hero-proof-avatar \+ \.hero-proof-avatar\s*\{[^}]*margin-left:\s*-8px/s);
  assert.match(css, /\.hero-proof-status\s*\{[^}]*background:\s*var\(--color-success\)/s);
  assert.match(css, /\.hero-variant-b \.hero-proof\s*\{[^}]*color:\s*var\(--color-core-light\)/s);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.hero-proof\s*\{[^}]*flex-wrap:\s*wrap/s);
});
```

- [ ] **Step 2: Run the layout test and verify it fails**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs
```

Expected: FAIL because `.hero-proof` does not exist in `styles.css`.

- [ ] **Step 3: Add the shared social-proof CSS**

Add this block after `.hero-actions .button`:

```css
.hero-proof {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: var(--space-1);
  min-height: 28px;
  margin-top: var(--space-3);
  color: var(--color-text-dark);
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: 0;
}

.hero-proof-avatars {
  display: flex;
  flex: 0 0 auto;
}

.hero-proof-avatar {
  display: block;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-surface);
  border-radius: 50%;
  background: var(--color-surface);
}

.hero-proof-avatar + .hero-proof-avatar {
  margin-left: -8px;
}

.hero-proof-copy {
  color: inherit;
  white-space: normal;
}

.hero-proof-copy strong {
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}

.hero-proof-status {
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
}

.hero-variant-b .hero-proof {
  color: var(--color-core-light);
}

.hero-variant-b .hero-proof-copy strong {
  color: var(--color-core-lightest);
}

.hero-variant-b .hero-proof-avatar {
  border-color: var(--color-core-darker);
}
```

- [ ] **Step 4: Add the narrow-screen wrapping rule**

Add this inside the existing `@media (max-width: 480px)` block:

```css
.hero-proof {
  flex-wrap: wrap;
  row-gap: var(--space-1);
  max-width: 280px;
}
```

- [ ] **Step 5: Run the complete test suite**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\*.test.mjs
```

Expected: all tests pass with zero failures.

---

### Task 3: Sync and Verify the Live Preview

**Files:**
- Copy: `index.html` to `C:\Users\diann\Music\Level Lab Grey Project\index.html`
- Copy: `styles.css` to `C:\Users\diann\Music\Level Lab Grey Project\styles.css`
- Copy: `assets/images/creator-avatar-1.svg` through `creator-avatar-5.svg` to the matching live assets folder.

**Interfaces:**
- Consumes: Completed source files from Tasks 1 and 2.
- Produces: A working local preview at `http://127.0.0.1:4173/index.html`.

- [ ] **Step 1: Sync the changed files to the preview folder**

Run:

```powershell
Copy-Item -LiteralPath 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\index.html' -Destination 'C:\Users\diann\Music\Level Lab Grey Project\index.html' -Force
Copy-Item -LiteralPath 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\styles.css' -Destination 'C:\Users\diann\Music\Level Lab Grey Project\styles.css' -Force
Copy-Item -LiteralPath 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\assets\images\creator-avatar-*.svg' -Destination 'C:\Users\diann\Music\Level Lab Grey Project\assets\images' -Force
```

- [ ] **Step 2: Verify the server and synced hashes**

Run:

```powershell
$response = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/index.html?hero=a' -TimeoutSec 5
$response.StatusCode
Get-FileHash 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\index.html','C:\Users\diann\Music\Level Lab Grey Project\index.html'
Get-FileHash 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\styles.css','C:\Users\diann\Music\Level Lab Grey Project\styles.css'
```

Expected: HTTP `200`; each source/live hash pair matches.

- [ ] **Step 3: Verify all hero versions in the in-app browser**

Open and inspect:

```text
http://127.0.0.1:4173/index.html?hero=a
http://127.0.0.1:4173/index.html?hero=b
http://127.0.0.1:4173/index.html?hero=c
```

For each URL, confirm five avatars, the exact activity copy, the green dot, and no collision with the video or CTA row.

- [ ] **Step 4: Verify responsive and theme states**

Check `1051x898`, `768x900`, `375x812`, and `320x700`. Confirm no horizontal overflow and that the avatar group remains intact while the copy wraps when necessary. Check both dark and light themes; in Version B, confirm the proof remains light over the scrim.

- [ ] **Step 5: Run final verification**

Run the complete test command from Task 2 Step 5 again.

Expected: all tests pass with zero failures after live-preview verification.
