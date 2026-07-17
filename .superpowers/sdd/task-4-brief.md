# Task 4 Brief

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

