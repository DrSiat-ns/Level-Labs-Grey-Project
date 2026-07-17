# Task 3 Brief

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

