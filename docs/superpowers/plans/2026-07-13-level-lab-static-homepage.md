# Level Lab Static Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an exact, responsive, interactive, offline-openable replica of the current Level Lab staging homepage with local Build, Play, and Sign In placeholder destinations.

**Architecture:** Use semantic static HTML, one shared CSS file, and one small progressive-enhancement JavaScript file. All application navigation and visual assets are relative local files so the prototype works through `file://`; external links are limited to the staging footer's social destinations.

**Tech Stack:** HTML5, CSS custom properties and media queries, vanilla JavaScript, Node.js built-in test runner for development-only contract checks, in-app browser screenshots for visual verification.

## Global Constraints

- Final destination: `C:\Users\diann\Music\Level Lab Grey Project`.
- The finished site must open by double-clicking `index.html` with no server, package install, or build step.
- Match `https://stage.levellab.com/` before making any product or content improvements.
- Preserve current staging copy, section order, visible media treatment, and interaction behavior.
- Use the public Level Lab style guide's dark theme, Roboto typography, 5px grid, and source tokens.
- Keep all design-prototype navigation local and all required visual assets inside `assets/`.
- Do not add real authentication, builder, game browser, remix, API, analytics, database, or internal Level Lab code.
- Support keyboard navigation, visible focus, 44px touch targets, reduced motion, and widths 375px through 1440px.
- The target folder is not a valid Git repository; do not initialize or modify repository metadata without a separate user request.

---

## File Map

- `index.html`: Exact semantic homepage content and local navigation.
- `build.html`: Local Build placeholder with return navigation.
- `play.html`: Local Play placeholder with return navigation.
- `sign-in.html`: Local Sign In placeholder with return navigation.
- `styles.css`: Level Lab tokens, homepage layout, shared placeholder layout, responsive rules, focus, and reduced motion.
- `script.js`: Smooth section navigation with reduced-motion fallback and media-error handling.
- `assets/images/grow.png`: Local copy of the staging Grow artwork.
- `assets/images/trust.png`: Local copy of the staging Trust artwork.
- `assets/media/background-dark.jpg`: Local dark landing-page background.
- `assets/media/background-light.jpg`: Local light landing-page background.
- `assets/media/welcome.mp4`: Local Welcome section video.
- `assets/media/splash-build-1080.mp4`: Local Build section video.
- `assets/media/splash-play-1080.mp4`: Local Play section video.
- `assets/icons/level-lab-mark.svg`: Local Level Lab header mark reproduced from the public page asset.
- `assets/fonts/roboto-300.woff2`: Local Roboto Light webfont used by staging.
- `assets/fonts/roboto-700.woff2`: Local Roboto Bold webfont used by staging.
- `tests/site.test.mjs`: Development-only checks for required files, offline-safe links, content, and interaction hooks.

### Task 1: Establish The Offline Site Contract

**Files:**
- Create: `tests/site.test.mjs`
- Create: `index.html`
- Create: `styles.css`
- Create: `script.js`

**Interfaces:**
- Produces: HTML files load `styles.css` and `script.js` using relative paths.
- Produces: The test helper `read(relativePath)` returns UTF-8 file contents.

- [ ] **Step 1: Write the failing offline-contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(resolve(root, relativePath), "utf8");

test("the homepage is a self-contained static entry point", async () => {
  const html = await read("index.html");
  assert.match(html, /<link[^>]+href="styles\.css"/);
  assert.match(html, /<script[^>]+src="script\.js"/);
  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/);
});
```

- [ ] **Step 2: Run the test and confirm the missing entry point fails**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs
```

Expected: FAIL with `ENOENT` for `index.html`.

- [ ] **Step 3: Create the minimal static entry point**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Level Lab</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>
    <main id="main"></main>
    <script src="script.js"></script>
  </body>
</html>
```

Create empty `styles.css` and `script.js` files so the browser loads only local dependencies.

- [ ] **Step 4: Run the offline-contract test**

Run the Node command from Step 2.

Expected: PASS, `1` test passed and `0` failed.

### Task 2: Reproduce The Homepage Content And Navigation

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Produces: Source section IDs `welcome`, `build`, `play`, `learn`, and `safety`.
- Produces: Local destinations `build.html`, `play.html`, and `sign-in.html`.
- Consumes: Relative `styles.css` and `script.js` contract from Task 1.

- [ ] **Step 1: Add failing structure and copy checks**

```js
test("homepage preserves the staging information architecture", async () => {
  const html = await read("index.html");
  for (const id of ["welcome", "build", "play", "learn", "safety"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const heading of [
    "Build. Play. Grow. Trust.",
    "Build the experience",
    "Play is just the beginning",
    "Games grow. So do you.",
    "Safe by design",
  ]) {
    assert.ok(html.includes(heading), `missing heading: ${heading}`);
  }
});

test("primary actions use local destinations", async () => {
  const html = await read("index.html");
  assert.match(html, /href="build\.html"/);
  assert.match(html, /href="play\.html"/);
  assert.match(html, /href="sign-in\.html"/);
  assert.match(html, /href="#build"[^>]*data-scroll-target="build"/);
});
```

- [ ] **Step 2: Run the structure tests and confirm they fail**

Expected: FAIL because the homepage sections and destinations do not exist.

- [ ] **Step 3: Implement the semantic staging-page structure**

Build `index.html` with:

```html
<body id="top">
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="site-header">
    <nav class="site-nav" aria-label="Primary navigation">
      <div class="site-nav__links">
        <a aria-current="page" href="index.html">Home</a>
        <a href="build.html">Build</a>
        <a href="play.html">Play</a>
      </div>
      <a class="brand" href="index.html" aria-label="Level Lab home">
        <img src="assets/icons/level-lab-mark.svg" alt="" width="30" height="30">
        <span>Level Lab</span>
      </a>
      <a class="button button--compact" href="sign-in.html">Sign In</a>
    </nav>
  </header>
  <main id="main">
    <section class="hero panel" id="welcome" aria-labelledby="hero-title">
      <div class="media-frame media-frame--hero" aria-hidden="true"></div>
      <div class="hero__content">
        <p class="eyebrow">Welcome</p>
        <h1 id="hero-title">Build. Play. Grow. Trust.</h1>
        <p>Level Lab is an online platform where you can dream up your own games, remix your favorites, and share creations with your friends!</p>
        <ul class="hero__benefits">
          <li><strong>Build</strong> — AI that keeps you in control</li>
          <li><strong>Play</strong> — Every game is yours to remix</li>
          <li><strong>Grow</strong> — A low floor and a high ceiling</li>
          <li><strong>Trust</strong> — Safety built in, not patched on</li>
        </ul>
      </div>
      <a class="scroll-cue" href="#build" data-scroll-target="build">Scroll to Learn More</a>
    </section>
    <section class="feature panel" id="build" aria-labelledby="build-title">
      <div class="feature__content">
        <p class="eyebrow">Build</p>
        <h2 id="build-title">Build the experience</h2>
        <p>Powerful AI that keeps you in control. Not a black box that builds for you, not a classic editor with AI bolted on as an afterthought. Create at AI speed; keep every piece visible, editable, and yours.</p>
        <ol class="steps">
          <li><span>1</span><strong>Describe</strong> — Start with AI, a template, or both</li>
          <li><span>2</span><strong>Polish</strong> — Tune by hand or together with the AI</li>
          <li><span>3</span><strong>Share</strong> — One click publishes it everywhere</li>
        </ol>
        <a class="button button--primary" href="build.html">Start Building</a>
      </div>
      <div class="media-frame" aria-hidden="true"></div>
    </section>
    <section class="feature panel feature--media-left" id="play" aria-labelledby="play-title">
      <div class="media-frame" aria-hidden="true"></div>
      <div class="feature__content">
        <p class="eyebrow">Play</p>
        <h2 id="play-title">Play is just the beginning</h2>
        <p>Tap a game and you're playing — no downloads, no installs, no waiting. Here, playing is how creating starts: Every game can be opened, learned from, and remixed.</p>
        <ol class="steps">
          <li><span>1</span><strong>See</strong> — Browse worlds made by creators like you</li>
          <li><span>2</span><strong>Play</strong> — Instantly in your browser, on any device</li>
          <li><span>3</span><strong>Remix</strong> — Make any game the start of your own</li>
        </ol>
        <a class="button button--primary" href="play.html">Explore Games</a>
      </div>
    </section>
    <section class="feature panel" id="learn" aria-labelledby="learn-title">
      <div class="feature__content">
        <p class="eyebrow">Grow</p>
        <h2 id="learn-title">Games grow. So do you.</h2>
        <p>Your first game takes minutes. What comes next is up to you: Custom art, tuned behaviors, deeper logic. Level Lab reveals depth as you grow — a low floor and a high ceiling.</p>
        <div class="feature-grid">
          <article><h3>Your Games Grow</h3><p>From a quick remix to a world that's unmistakably yours.</p></article>
          <article><h3>Your Skills Grow</h3><p>Every game you open shows you how games really work.</p></article>
          <article><h3>Your Audience Grows</h3><p>Share your world and watch it become someone else's beginning.</p></article>
        </div>
      </div>
      <img class="feature__image" src="assets/images/grow.png" alt="" width="640" height="640" data-media-fallback>
    </section>
    <section class="feature panel feature--media-left" id="safety" aria-labelledby="safety-title">
      <img class="feature__image" src="assets/images/trust.png" alt="" width="640" height="640" data-media-fallback>
      <div class="feature__content">
        <p class="eyebrow">Trust</p>
        <h2 id="safety-title">Safe by design</h2>
        <p>Trust is the ground everything else stands on. Every layer of Level Lab is built to reduce risk and enable creativity — so creators can focus on making, not worrying.</p>
        <div class="feature-grid feature-grid--four">
          <article><h3>AI Moderation</h3><p>Hate speech and inappropriate content are filtered as they're created — not after they spread.</p></article>
          <article><h3>Private by Default</h3><p>Who you are stays hidden. The platform shields every user's identity from day one.</p></article>
          <article><h3>Guardians in the Loop</h3><p>Guardian-managed accounts and simple reporting keep families involved.</p></article>
          <article><h3>Safe at Every Layer</h3><p>Every design decision is weighed against risk — protection is built in, not patched on.</p></article>
        </div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div><a href="#">EULA</a><a href="#">Privacy</a></div>
      <div class="site-footer__social">
        <a href="https://www.tiktok.com/@levellabinc">TikTok</a>
        <a href="https://www.instagram.com/levellabinc">Instagram</a>
        <a href="https://www.facebook.com/levellabinc">Facebook</a>
        <a href="https://www.youtube.com/@LevelLabInc">YouTube</a>
      </div>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
```

Use this visible copy exactly. During visual verification, preserve any source text casing that CSS transforms for display.

- [ ] **Step 4: Run all contract tests**

Expected: PASS for the offline, structure, heading, section, and local-link checks.

### Task 3: Match The Level Lab Visual System And Responsive Layout

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `styles.css`

**Interfaces:**
- Consumes: Class names and section IDs from Task 2.
- Produces: Shared token names `--color-background`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-dark`, `--color-accent`, and `--grid-unit`.

- [ ] **Step 1: Add failing style-token and breakpoint checks**

```js
test("styles preserve Level Lab tokens and required responsive states", async () => {
  const css = await read("styles.css");
  for (const value of ["#1a1a1a", "#252525", "#3a3a3a", "#e5e5e5", "#0077ff"]) {
    assert.ok(css.includes(value), `missing Level Lab color ${value}`);
  }
  assert.match(css, /--grid-unit:\s*5px/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
});
```

- [ ] **Step 2: Run tests and confirm the CSS contract fails**

Expected: FAIL because `styles.css` does not contain the Level Lab tokens.

- [ ] **Step 3: Implement the exact token and layout foundation**

```css
:root {
  --grid-unit: 5px;
  --color-background: #1a1a1a;
  --color-surface: #252525;
  --color-surface-light: #3a3a3a;
  --color-border: #3a3a3a;
  --color-text: #e5e5e5;
  --color-text-dark: #c5c5c5;
  --color-mid: #8c8c8c;
  --color-accent: #0077ff;
  --font-family: Roboto, Arial, sans-serif;
  --radius-sm: 5px;
  --radius-lg: 10px;
  --content-width: 1400px;
  --header-height: 75px;
}

* { box-sizing: border-box; }
html { color-scheme: dark; scroll-behavior: smooth; }
body {
  margin: 0;
  min-width: 320px;
  background: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.55;
}
a:focus-visible, button:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }
.site-header { min-height: var(--header-height); border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
.site-nav { width: min(100% - 40px, var(--content-width)); min-height: var(--header-height); margin: auto; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
.site-nav__links, .site-footer__social { display: flex; align-items: center; gap: 30px; }
.site-nav > .button { justify-self: end; }
.brand { display: inline-flex; align-items: center; gap: 12px; justify-self: center; color: var(--color-text-dark); text-decoration: none; font-size: 22px; }
.brand img { display: block; width: 30px; height: 30px; object-fit: contain; }
a { color: var(--color-text-dark); text-underline-offset: 4px; }
a:hover, a[aria-current="page"] { color: var(--color-text); }
.skip-link { position: fixed; z-index: 1000; inset: 10px auto auto 10px; padding: 10px 15px; background: var(--color-accent); color: white; transform: translateY(-150%); }
.skip-link:focus { transform: translateY(0); }
.button { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text); text-decoration: none; transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease; }
.button:hover { border-color: var(--color-mid); background: var(--color-surface-light); }
.button--primary { border-color: var(--color-accent); background: var(--color-accent); color: white; }
.panel { width: min(calc(100% - 40px), 1130px); margin: 75px auto; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: rgba(37, 37, 37, 0.82); }
.hero, .feature { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr); gap: 75px; padding: 75px; }
.hero { position: relative; align-items: center; }
.hero__content, .feature__content { align-self: center; min-width: 0; }
.hero__benefits, .steps { margin: 30px 0; padding: 0; list-style: none; }
.hero__benefits li { position: relative; padding-left: 25px; margin-block: 15px; }
.hero__benefits li::before { content: ""; position: absolute; left: 5px; top: 0.7em; width: 6px; height: 6px; border-radius: 50%; background: var(--color-accent); }
.scroll-cue { position: absolute; right: 75px; bottom: 25px; min-height: 44px; display: inline-flex; align-items: center; text-decoration: none; }
.eyebrow { margin: 0 0 20px; color: color-mix(in srgb, var(--color-accent) 50%, var(--color-text)); font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; }
h1, h2, h3, p { margin-top: 0; }
h1, h2 { margin-bottom: 25px; font-weight: 700; line-height: 1.1; }
h1 { font-size: clamp(44px, 5vw, 66px); }
h2 { font-size: clamp(36px, 4vw, 56px); }
h3 { font-size: 20px; }
.feature--media-left { grid-template-columns: minmax(320px, 0.8fr) minmax(0, 1.4fr); }
.steps { counter-reset: level-lab-step; display: grid; gap: 15px; }
.steps li { display: grid; grid-template-columns: 35px 1fr; column-gap: 15px; align-items: start; }
.steps li > span { grid-row: 1 / span 2; width: 35px; height: 35px; display: grid; place-items: center; border: 1px solid var(--color-border); border-radius: 50%; color: var(--color-text); }
.feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 30px; }
.feature-grid--four { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.feature-grid article { padding-top: 20px; border-top: 1px solid var(--color-border); }
.feature__image { align-self: center; display: block; width: 100%; height: auto; object-fit: contain; }
.media-frame { min-height: 430px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: linear-gradient(145deg, #31528c 0%, #17253e 42%, #1a1a1a 78%); }
.media-frame--fallback { background: var(--color-background); }
.site-footer { border-top: 1px solid var(--color-border); background: var(--color-surface); }
.site-footer__inner { width: min(100% - 40px, var(--content-width)); min-height: 100px; margin: auto; display: flex; align-items: center; justify-content: space-between; gap: 30px; }
.site-footer__inner > div:first-child { display: flex; gap: 30px; }
.placeholder-page { min-height: 100dvh; display: grid; place-items: center; padding: 30px; }
.placeholder-page__content { width: min(100%, 650px); padding: 50px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); }
.placeholder-page__content .brand { justify-self: start; margin-bottom: 75px; }

@media (max-width: 768px) {
  .site-nav { width: min(100% - 30px, var(--content-width)); grid-template-columns: 1fr auto; }
  .site-nav__links { gap: 20px; }
  .brand span { display: none; }
  .button--compact { display: none; }
  .hero, .feature { grid-template-columns: 1fr; gap: 30px; padding: 30px; }
  .feature--media-left .media-frame, .feature--media-left .feature__image { order: -1; }
  .panel { width: min(calc(100% - 30px), 1130px); margin-block: 30px; }
  .media-frame { min-height: 260px; }
  .scroll-cue { position: static; grid-column: 1; justify-self: end; }
  .feature-grid, .feature-grid--four { grid-template-columns: 1fr; }
  .site-footer__inner { min-height: 140px; padding-block: 30px; flex-direction: column; align-items: flex-start; }
  .site-footer__social { flex-wrap: wrap; gap: 15px 20px; }
  .placeholder-page__content { padding: 30px; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Use the selectors and declarations above as the complete first visual pass. Refine their numeric values only during Task 5 screenshot comparison, keeping the named tokens and source content unchanged.

- [ ] **Step 4: Run all contract tests**

Expected: PASS with no missing token, breakpoint, focus, or reduced-motion checks.

### Task 4: Add Local Destinations And Progressive Interactions

**Files:**
- Create: `build.html`
- Create: `play.html`
- Create: `sign-in.html`
- Modify: `tests/site.test.mjs`
- Modify: `script.js`

**Interfaces:**
- Consumes: `[data-scroll-target]` and `[data-media-fallback]` attributes from HTML.
- Produces: Local placeholder pages with `.placeholder-page` and a link back to `index.html`.

- [ ] **Step 1: Add failing page and interaction checks**

```js
test("local destination pages are present and return home", async () => {
  for (const page of ["build.html", "play.html", "sign-in.html"]) {
    const html = await read(page);
    assert.match(html, /href="index\.html"/);
    assert.match(html, /class="placeholder-page"/);
  }
});

test("scroll and media behavior is progressively enhanced", async () => {
  const js = await read("script.js");
  assert.match(js, /data-scroll-target/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /data-media-fallback/);
});
```

- [ ] **Step 2: Run tests and confirm the missing pages fail**

Expected: FAIL with `ENOENT` for `build.html`.

- [ ] **Step 3: Create the shared placeholder-page markup**

Use this complete structure for each destination, changing only the title and one-sentence status:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Build | Level Lab</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body class="placeholder-page">
    <main class="placeholder-page__content">
      <a class="brand" href="index.html"><img src="assets/icons/level-lab-mark.svg" alt="" width="30" height="30"><span>Level Lab</span></a>
      <p class="eyebrow">Build</p>
      <h1>This space comes next.</h1>
      <p>The builder will be designed after the homepage baseline is approved.</p>
      <a class="button button--primary" href="index.html">Back to Home</a>
    </main>
  </body>
</html>
```

- [ ] **Step 4: Implement progressive interactions**

```js
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-scroll-target]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.getElementById(link.dataset.scrollTarget);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  });
});

document.querySelectorAll("[data-media-fallback]").forEach((media) => {
  media.addEventListener("error", () => {
    media.hidden = true;
    media.closest(".media-frame")?.classList.add("media-frame--fallback");
  }, { once: true });
});
```

- [ ] **Step 5: Run all contract tests**

Expected: PASS for all files, local routes, return links, and JavaScript hooks.

### Task 5: Localize Public Assets And Verify Fidelity

**Files:**
- Create: `assets/images/grow.png`
- Create: `assets/images/trust.png`
- Create: `assets/media/background-dark.jpg`
- Create: `assets/media/background-light.jpg`
- Create: `assets/media/welcome.mp4`
- Create: `assets/media/splash-build-1080.mp4`
- Create: `assets/media/splash-play-1080.mp4`
- Create: `assets/icons/level-lab-mark.svg`
- Create: `assets/fonts/roboto-300.woff2`
- Create: `assets/fonts/roboto-700.woff2`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `.media-frame` containers from Task 2 and fallback behavior from Task 4.
- Produces: No required homepage image depends on `stage.levellab.com` at runtime.

- [ ] **Step 1: Add the failing local-asset checks**

```js
test("required visual assets are local", async () => {
  const html = await read("index.html");
  assert.doesNotMatch(html, /(?:src|poster)="https?:\/\//);
  await Promise.all([
    readFile(resolve(root, "assets/images/grow.png")),
    readFile(resolve(root, "assets/images/trust.png")),
    readFile(resolve(root, "assets/media/background-dark.jpg")),
    readFile(resolve(root, "assets/media/background-light.jpg")),
    readFile(resolve(root, "assets/media/welcome.mp4")),
    readFile(resolve(root, "assets/media/splash-build-1080.mp4")),
    readFile(resolve(root, "assets/media/splash-play-1080.mp4")),
    readFile(resolve(root, "assets/icons/level-lab-mark.svg")),
    readFile(resolve(root, "assets/fonts/roboto-300.woff2")),
    readFile(resolve(root, "assets/fonts/roboto-700.woff2")),
  ]);
});
```

- [ ] **Step 2: Run tests and confirm the missing assets fail**

Expected: FAIL with `ENOENT` for the first missing local asset.

- [ ] **Step 3: Save the public staging assets locally**

Save the two observed public assets from:

```text
https://stage.levellab.com/media/grow.png?v=07597b2
https://stage.levellab.com/media/trust.png?v=07597b2
https://stage.levellab.com/media/background-dark.jpg
https://stage.levellab.com/media/background-light.jpg
https://stage.levellab.com/media/welcome.mp4?v=07597b2
https://stage.levellab.com/media/splash-build-1080.mp4?v=07597b2
https://stage.levellab.com/media/splash-play-1080.mp4?v=07597b2
```

Store them as `assets/images/grow.png` and `assets/images/trust.png`. Read the public header element `.app-name #logomark-icon svg`, serialize its complete `outerHTML`, and save that SVG unchanged as `assets/icons/level-lab-mark.svg`; verify that its source `viewBox` remains `0 0 2048 2048`.

Read the public font stylesheet below and save the two `woff2` resources for weights 300 and 700 as `assets/fonts/roboto-300.woff2` and `assets/fonts/roboto-700.woff2`:

```text
https://fonts.googleapis.com/css2?family=Roboto:wght@300;700&display=fallback
```

Add local font faces to the top of `styles.css` and update `index.html` to reference only relative image, icon, script, and stylesheet paths:

```css
@font-face { font-family: "Roboto"; src: url("assets/fonts/roboto-300.woff2") format("woff2"); font-style: normal; font-weight: 300; font-display: fallback; }
@font-face { font-family: "Roboto"; src: url("assets/fonts/roboto-700.woff2") format("woff2"); font-style: normal; font-weight: 700; font-display: fallback; }
```

- [ ] **Step 4: Run the complete automated contract suite**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs
```

Expected: all tests PASS with `0` failures.

- [ ] **Step 5: Verify direct-open behavior**

Open `C:\Users\diann\Music\Level Lab Grey Project\index.html` through the in-app browser using its `file://` URL. Confirm the homepage renders without a server, all three local destinations open, every destination returns home, and browser console logs contain no errors.

- [ ] **Step 6: Perform visual comparison at required widths**

Compare local screenshots against `https://stage.levellab.com/` at:

```text
375x812
768x1024
1024x768
1280x720
1440x900
```

At each viewport, confirm matching section order, text wrapping, panel widths, media proportions, header behavior, spacing rhythm, colors, and typography. Correct any mismatch in `styles.css`, then recapture the viewport.

- [ ] **Step 7: Perform accessibility and fallback checks**

Verify keyboard tab order, visible focus, 44px interactive targets, 200% browser text scaling, reduced-motion scrolling, no horizontal overflow, and a stable dark media surface when a local image source is temporarily changed to a missing filename.

- [ ] **Step 8: Copy the verified project to the requested destination**

Copy `index.html`, destination HTML files, `styles.css`, `script.js`, `assets/`, `tests/`, and `docs/` to `C:\Users\diann\Music\Level Lab Grey Project`. Reopen the copied `index.html` and repeat the direct-open smoke check so the delivered location, not the staging workspace, is the final verified artifact.
