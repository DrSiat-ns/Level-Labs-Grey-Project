# Level Lab Hero Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Version A, Version B, and Version C links after Play in the real homepage navigation, default to Version A, and render the selected hero without changing the rest of the homepage.

**Architecture:** Keep one static `index.html` and use `?hero=a|b|c` links so each state is refreshable and shareable. The document contains three hero panels, with only Version A visible by default; `hero-variants.mjs` validates the query, exposes exactly one panel, updates the selected navigation link, and loads only the active panel's video. Existing homepage behavior stays in `script.js`.

**Tech Stack:** Static HTML5, CSS, vanilla JavaScript ES modules, Node.js built-in test runner, local Python HTTP preview.

## Global Constraints

- Work in `C:\Users\diann\Music\Level Lab Grey Project`.
- Do not modify Level Lab's application internals or add package dependencies.
- Preserve Background `#1a1a1a`, Surface `#252525`, Border `#3a3a3a`, Primary text `#e5e5e5`, Secondary text `#c5c5c5`, Accent `#0077ff`, Roboto, the 5px spacing rhythm, and 5px/10px radii.
- Navigation order is Home, Build, Play, Version A, Version B, Version C.
- `index.html` and unsupported `hero` values default to Version A.
- Start Creating links to `build.html`; Play links to `play.html`.
- Inactive panels must be hidden from the accessibility tree and must not load video.
- Buttons and version links must expose at least a 44px interaction area with at least 8px between the two hero CTAs.
- Reduced-motion mode must not autoplay the hero video.
- Keep Build, Play, Grow, Trust, and footer markup unchanged.
- This folder is not a Git repository. Do not initialize Git; use test and review checkpoints in place of commit steps.

## File Structure

- Modify `index.html`: add the version links, three hero panels, and the hero controller module.
- Modify `styles.css`: style the navigation switcher, shared hero foundation, Versions A/B/C, responsive states, and reduced motion.
- Create `hero-variants.mjs`: normalize the URL state, activate one hero, update navigation state, and manage the active video lifecycle.
- Modify `tests/site.test.mjs`: replace the old hero-copy contract and add static markup/style regressions.
- Create `tests/hero-variants.test.mjs`: unit-test URL normalization without a browser dependency.

---

### Task 1: Lock The A/B/C Homepage Contract

**Files:**
- Modify: `tests/site.test.mjs`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: Existing `read(relativePath)` helper.
- Produces: Static contracts for the navigation order, hero panel markup, CTA destinations, lazy video sources, responsive labels, and module loading.

- [ ] **Step 1: Replace the old Welcome heading expectation**

In `homepage preserves the staging information architecture`, keep the section-id loop and replace the heading array with:

```js
for (const heading of [
  "Make a game. Make it yours.",
  "Your idea. Playable in minutes.",
  "Imagine it. Build it. Remix everything.",
  "Build the experience",
  "Play is just the beginning",
  "Games grow. So do you.",
  "Safe by design",
]) {
  assert.ok(html.includes(heading), `missing heading: ${heading}`);
}
```

- [ ] **Step 2: Add a failing navigation and hero markup test**

Append this test to `tests/site.test.mjs`:

```js
test("homepage exposes three shareable hero versions and defaults to A", async () => {
  const html = await read("index.html");
  const orderedLinks = [
    'id="nav-play"',
    'href="index.html?hero=a"',
    'href="index.html?hero=b"',
    'href="index.html?hero=c"',
  ];
  let previousIndex = -1;
  for (const fragment of orderedLinks) {
    const currentIndex = html.indexOf(fragment);
    assert.ok(currentIndex > previousIndex, `navigation fragment out of order: ${fragment}`);
    previousIndex = currentIndex;
  }

  assert.match(html, /data-hero-panel="a"(?![^>]*hidden)/);
  assert.match(html, /data-hero-panel="b"[^>]*hidden/);
  assert.match(html, /data-hero-panel="c"[^>]*hidden/);
  assert.equal((html.match(/data-hero-video/g) || []).length, 3);
  assert.equal((html.match(/data-src="assets\/media\/welcome\.mp4"/g) || []).length, 3);
  assert.doesNotMatch(html, /data-hero-video[^>]*\ssrc=/);
  assert.match(html, /<script type="module" src="hero-variants\.mjs"><\/script>/);
});
```

- [ ] **Step 3: Add a failing shared CTA and responsive-label test**

Append:

```js
test("each hero version keeps the approved actions and accessible labels", async () => {
  const html = await read("index.html");
  assert.equal((html.match(/>Start Creating<\/a>/g) || []).length, 3);
  assert.equal((html.match(/aria-label="Play games"/g) || []).length, 3);
  assert.equal((html.match(/href="build\.html"/g) || []).length >= 4, true);
  assert.equal((html.match(/href="play\.html"/g) || []).length >= 4, true);
  for (const version of ["A", "B", "C"]) {
    assert.ok(html.includes(`aria-label="Version ${version}"`));
    assert.ok(html.includes(`<span class="version-word">Version </span>${version}`));
  }
});
```

In `styles preserve Level Lab tokens and required responsive states`, add:

```js
assert.match(css, /\.nav-version\s*\{[^}]*min-height:\s*44px/s);
assert.match(css, /\.hero-actions \.button\s*\{[^}]*height:\s*44px/s);
assert.match(css, /\.version-word\s*\{[^}]*display:\s*none/s);
```

- [ ] **Step 4: Run the focused tests and verify failure**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs
```

Expected: FAIL because the three version links, panels, new copy, and module script do not exist yet.

- [ ] **Step 5: Record the red-state checkpoint**

Record the failing test names before editing production files. Do not proceed unless failures match the missing A/B/C behavior rather than an unrelated baseline regression.

---

### Task 2: Add The Navigation Links And Three Hero Panels

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: Existing Level Lab tokens and `assets/media/welcome.mp4`.
- Produces: `[data-hero-version]` links and `[data-hero-panel]` panels for `hero-variants.mjs`.

- [ ] **Step 1: Add the three links directly after Play**

Replace the current Home/Build/Play navigation block with:

```html
<nav class="nav-global" aria-label="Primary navigation">
  <a class="nav-link" id="nav-home" href="index.html">Home</a>
  <a class="nav-link" id="nav-build" href="build.html">Build</a>
  <a class="nav-link" id="nav-play" href="play.html">Play</a>
  <a class="nav-link nav-version active" href="index.html?hero=a" data-hero-version="a" aria-label="Version A" aria-current="page"><span class="version-word">Version </span>A</a>
  <a class="nav-link nav-version" href="index.html?hero=b" data-hero-version="b" aria-label="Version B"><span class="version-word">Version </span>B</a>
  <a class="nav-link nav-version" href="index.html?hero=c" data-hero-version="c" aria-label="Version C"><span class="version-word">Version </span>C</a>
</nav>
```

- [ ] **Step 2: Replace only the current Welcome section**

Replace the complete section whose opening tag contains `id="welcome"` with:

```html
<section class="hero-shell reveal is-visible" id="welcome">
  <div class="hero-variant hero-variant-a" data-hero-panel="a">
    <div class="hero-copy">
      <span class="section-eyebrow">Create · Play · Remix</span>
      <h1 class="hero-title">Make a game. <span>Make it yours.</span></h1>
      <p class="hero-lead">Turn an idea into a playable 3D game, then remix every piece until it feels like you.</p>
      <div class="hero-actions">
        <a class="button hero-primary" href="build.html">Start Creating</a>
        <a class="button hero-secondary" href="play.html" aria-label="Play games"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.75v10.5L13 8 4 2.75Z"></path></svg>Play</a>
      </div>
    </div>
    <div class="hero-window hero-media">
      <div class="hero-window-bar"><span></span><span></span><span></span><small>Made in Level Lab</small></div>
      <video class="hero-video" data-hero-video data-src="assets/media/welcome.mp4" muted loop playsinline preload="none" poster="assets/media/background-dark.jpg" data-media-fallback></video>
    </div>
  </div>

  <div class="hero-variant hero-variant-b" data-hero-panel="b" hidden>
    <div class="hero-media hero-canvas">
      <video class="hero-video" data-hero-video data-src="assets/media/welcome.mp4" muted loop playsinline preload="none" poster="assets/media/background-dark.jpg" data-media-fallback></video>
    </div>
    <div class="hero-scrim" aria-hidden="true"></div>
    <div class="hero-copy">
      <span class="section-eyebrow">Built to be played</span>
      <h1 class="hero-title">Your idea. <span>Playable in minutes.</span></h1>
      <p class="hero-lead">Create, play, and remix directly in your browser.</p>
      <div class="hero-actions">
        <a class="button hero-primary" href="build.html">Start Creating</a>
        <a class="button hero-secondary" href="play.html" aria-label="Play games"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.75v10.5L13 8 4 2.75Z"></path></svg>Play</a>
      </div>
    </div>
  </div>

  <div class="hero-variant hero-variant-c" data-hero-panel="c" hidden>
    <div class="hero-copy">
      <span class="section-eyebrow">No download. No black box.</span>
      <h1 class="hero-title">Imagine it. Build it. <span>Remix everything.</span></h1>
      <p class="hero-lead">A real game-making workspace that grows with every idea.</p>
      <div class="hero-actions">
        <a class="button hero-primary" href="build.html">Start Creating</a>
        <a class="button hero-secondary" href="play.html" aria-label="Play games"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.75v10.5L13 8 4 2.75Z"></path></svg>Play</a>
      </div>
    </div>
    <div class="hero-reveal hero-media">
      <span class="hero-reveal-label">Inside Level Lab</span>
      <video class="hero-video" data-hero-video data-src="assets/media/welcome.mp4" muted loop playsinline preload="none" poster="assets/media/background-dark.jpg" data-media-fallback></video>
    </div>
  </div>
</section>
```

Leave the existing Build section as the next sibling of `#welcome`.

- [ ] **Step 3: Load the future controller after the existing script**

At the end of `index.html`, use:

```html
<script src="script.js"></script>
<script type="module" src="hero-variants.mjs"></script>
```

- [ ] **Step 4: Add the shared hero and navigation CSS**

Append this block before the existing responsive rules in `styles.css`:

```css
:root {
  --color-accent-action: #0068e6;
}

.nav-version {
  min-height: 44px;
}

.hero-shell {
  position: relative;
  width: 100%;
  max-width: var(--width-content);
  min-height: clamp(500px, calc(100dvh - var(--height-header) - var(--height-footer) - 120px), 680px);
  margin: 0 auto;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-background);
}

.hero-variant {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.hero-variant[hidden] {
  display: none;
}

.hero-copy {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100% - 40px, 820px);
  padding-top: clamp(45px, 8vh, 85px);
  text-align: center;
}

.hero-title {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(38px, 6vw, 72px);
  line-height: 1.02;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
}

.hero-title span {
  color: var(--color-accent-text);
}

.hero-lead {
  max-width: 680px;
  margin: var(--space-3) 0 0;
  color: var(--color-text-dark);
  font-size: 18px;
  line-height: 1.55;
}

.hero-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.hero-actions .button {
  min-width: 150px;
  height: 44px;
  padding: 0 var(--space-4);
  font-weight: var(--font-weight-bold);
}

.hero-primary {
  border-color: var(--color-accent-action);
  background: var(--color-accent-action);
  color: #ffffff;
}

.hero-secondary {
  gap: var(--space-2);
  border-color: var(--color-border-light);
  background: var(--color-surface);
  color: var(--color-text);
}

.hero-media {
  overflow: hidden;
  background: var(--color-surface);
}

.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-window {
  position: absolute;
  right: max(25px, 7%);
  bottom: -90px;
  left: max(25px, 7%);
  z-index: 2;
  height: 260px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.hero-window-bar {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  height: 30px;
  padding: 0 var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.hero-window-bar > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-mid);
}

.hero-window-bar small {
  margin-left: auto;
  color: var(--color-text-dark);
}

.hero-window .hero-video {
  height: calc(100% - 30px);
}

.hero-canvas,
.hero-scrim {
  position: absolute;
  inset: 0;
}

.hero-scrim {
  z-index: 1;
  background: rgba(15, 15, 15, 0.66);
}

.hero-variant-b {
  justify-content: flex-end;
}

.hero-variant-b .hero-copy {
  justify-content: flex-end;
  min-height: 100%;
  padding-bottom: clamp(45px, 8vh, 80px);
}

.hero-variant-b .hero-lead {
  color: var(--color-text);
}

.hero-variant-c .hero-copy {
  padding-top: clamp(35px, 6vh, 65px);
}

.hero-reveal {
  position: absolute;
  right: 0;
  bottom: -35px;
  left: 0;
  z-index: 2;
  height: 42%;
  border-top: 1px solid var(--color-border);
}

.hero-reveal-label {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  z-index: 1;
  padding: var(--space-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-background) 85%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}
```

- [ ] **Step 5: Add responsive and reduced-motion CSS**

Extend the existing `@media (max-width: 768px)` block with:

```css
.version-word {
  display: none;
}

.panel-center .app-name > span {
  display: none;
}

.nav-global {
  gap: var(--space-2);
}

.nav-version {
  min-width: 28px;
  justify-content: center;
}

.hero-shell {
  min-height: min(560px, calc(100dvh - var(--height-header) - 55px));
}

.hero-copy {
  width: min(100% - 30px, 680px);
  padding-top: 35px;
}

.hero-title {
  font-size: clamp(34px, 11vw, 48px);
}

.hero-lead {
  font-size: 16px;
}

.hero-actions {
  width: 100%;
}

.hero-actions .button {
  flex: 1;
  min-width: 0;
}

.hero-window {
  right: 15px;
  bottom: -65px;
  left: 15px;
  height: 205px;
}

.hero-reveal {
  height: 34%;
}
```

Add to the existing `@media (prefers-reduced-motion: reduce)` block:

```css
.hero-video {
  display: block;
}
```

The reduced-motion controller will leave the video on its poster without assigning `src`.

- [ ] **Step 6: Run the static tests**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs
```

Expected: all `site.test.mjs` tests pass. Query normalization remains untested until Task 3.

- [ ] **Step 7: Record the markup checkpoint**

Confirm the diff changes only `index.html`, `styles.css`, and `tests/site.test.mjs`. Confirm the Build section begins immediately after the new hero shell and was not edited.

---

### Task 3: Implement URL Selection And Video Lifecycle

**Files:**
- Create: `hero-variants.mjs`
- Create: `tests/hero-variants.test.mjs`
- Modify: `tests/site.test.mjs`
- Test: `tests/hero-variants.test.mjs`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Produces: `normalizeHeroVersion(search: string): "a" | "b" | "c"` and `setupHeroVariants(root, search, motionQuery)`.
- Consumes: `[data-hero-version]`, `[data-hero-panel]`, `[data-hero-video]`, and each video's `data-src`.

- [ ] **Step 1: Write the failing URL normalization tests**

Create `tests/hero-variants.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeHeroVersion } from "../hero-variants.mjs";

test("hero query accepts a, b, and c", () => {
  assert.equal(normalizeHeroVersion("?hero=a"), "a");
  assert.equal(normalizeHeroVersion("?hero=b"), "b");
  assert.equal(normalizeHeroVersion("?hero=c"), "c");
});

test("hero query defaults unsupported and missing values to a", () => {
  assert.equal(normalizeHeroVersion(""), "a");
  assert.equal(normalizeHeroVersion("?hero=z"), "a");
  assert.equal(normalizeHeroVersion("?other=b"), "a");
  assert.equal(normalizeHeroVersion("?hero=B"), "a");
});
```

- [ ] **Step 2: Run the unit test and verify failure**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\hero-variants.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `hero-variants.mjs`.

- [ ] **Step 3: Create the hero controller**

Create `hero-variants.mjs`:

```js
export const HERO_VERSIONS = new Set(["a", "b", "c"]);

export function normalizeHeroVersion(search = "") {
  const value = new URLSearchParams(search).get("hero");
  return HERO_VERSIONS.has(value) ? value : "a";
}

export function setupHeroVariants(
  root = document,
  search = window.location.search,
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)"),
) {
  const activeVersion = normalizeHeroVersion(search);
  const links = root.querySelectorAll("[data-hero-version]");
  const panels = root.querySelectorAll("[data-hero-panel]");

  links.forEach((link) => {
    const isActive = link.dataset.heroVersion === activeVersion;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  let activeVideo = null;
  panels.forEach((panel) => {
    const isActive = panel.dataset.heroPanel === activeVersion;
    panel.hidden = !isActive;
    const video = panel.querySelector("[data-hero-video]");
    if (!video || !isActive) return;
    activeVideo = video;
    if (!motionQuery.matches && video.dataset.src) {
      video.src = video.dataset.src;
      video.addEventListener("loadeddata", () => video.classList.add("is-loaded"), { once: true });
    }
  });

  if (!activeVideo || motionQuery.matches) return activeVersion;

  const visibilityObserver = new IntersectionObserver((entries) => {
    const visible = entries.some((entry) => entry.isIntersecting);
    if (visible) {
      activeVideo.play().catch(() => {});
    } else {
      activeVideo.pause();
    }
  }, { threshold: 0.15 });

  visibilityObserver.observe(activeVideo);
  return activeVersion;
}

if (typeof document !== "undefined") {
  setupHeroVariants();
}
```

- [ ] **Step 4: Extend the progressive-enhancement contract**

In `homepage behavior is progressively enhanced`, add:

```js
const heroJs = await read("hero-variants.mjs");
assert.match(heroJs, /URLSearchParams/);
assert.match(heroJs, /data-hero-panel/);
assert.match(heroJs, /data-hero-video/);
assert.match(heroJs, /IntersectionObserver/);
assert.match(heroJs, /prefers-reduced-motion/);
```

- [ ] **Step 5: Run both test files**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs tests\hero-variants.test.mjs
```

Expected: 11 tests pass with no failures.

- [ ] **Step 6: Record the behavior checkpoint**

Confirm only the active panel receives `src`, the active link alone has `aria-current="page"`, and invalid query values resolve to A.

---

### Task 4: Verify The Real Homepage At All Required Sizes

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `hero-variants.mjs`
- Verify: `tests/site.test.mjs`
- Verify: `tests/hero-variants.test.mjs`

**Interfaces:**
- Consumes: The three finished URL states.
- Produces: A verified homepage served from `http://127.0.0.1:4173/index.html`.

- [ ] **Step 1: Run the complete automated suite**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs tests\hero-variants.test.mjs
```

Expected: 11 tests pass, zero failures.

- [ ] **Step 2: Confirm every URL is served**

Run:

```powershell
@(
  'http://127.0.0.1:4173/index.html',
  'http://127.0.0.1:4173/index.html?hero=a',
  'http://127.0.0.1:4173/index.html?hero=b',
  'http://127.0.0.1:4173/index.html?hero=c',
  'http://127.0.0.1:4173/index.html?hero=z'
) | ForEach-Object { (Invoke-WebRequest -UseBasicParsing $_).StatusCode }
```

Expected: five `200` responses.

- [ ] **Step 3: Run the UI/UX Pro Max pre-delivery query**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' 'C:\Users\diann\.codex\skills\ui-ux-pro-max\scripts\search.py' 'animation accessibility z-index loading touch targets reduced motion' --domain ux
```

Expected: review guidance covering reduced motion, touch spacing, and touch-friendly responsive layouts; compare each result against the implementation.

- [ ] **Step 4: Inspect A, B, and C in the browser**

At 1440px, 1024px, 768px, and 375px widths, verify:

```text
Navigation order: Home, Build, Play, Version A, Version B, Version C
Desktop labels: Version A, Version B, Version C
Mobile labels: A, B, C with full accessible names
Selected version: one active link and one visible hero panel
Primary CTA: Start Creating, blue, links to build.html
Secondary CTA: Play, neutral, links to play.html
Below-fold cue: the beginning of Build remains visible
Layout: no horizontal scroll, clipped text, overlap, or empty media
```

- [ ] **Step 5: Verify accessibility and media behavior**

Use keyboard Tab navigation to confirm focus order and visible rings. Enable reduced motion and confirm the hero stays on its poster without video playback. Scroll the hero out of view in normal-motion mode and confirm playback pauses; scroll back and confirm it resumes.

- [ ] **Step 6: Check browser console and canvas/media rendering**

Expected: no console errors, no rejected media errors, and nonblank hero media in every normal-motion variant.

- [ ] **Step 7: Final checkpoint**

List the changed files and fresh verification results. Keep the local preview server running so the user can compare A, B, and C immediately.
