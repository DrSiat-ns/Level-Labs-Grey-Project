# Task 4 Verification Sidecar

## Verdict

CONDITIONAL - all automated, static, responsive, and media checks pass. Strict Task 4 sign-off remains pending manual native Tab traversal and OS-level reduced-motion verification, or an explicit owner waiver for those two checks. The prior mobile version-link sizing failure is resolved in the live target.

## Scope and Boundary

- Target inspected: `C:\Users\diann\Music\Level Lab Grey Project`.
- This sidecar re-ran the automated suite, HTTP checks, and static audit. It modified only this report.
- The browser evidence below was performed and supplied by the parent session. It is recorded as parent-session evidence, not as a browser run performed by this sidecar.

## Automated Suite

Command run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs tests\hero-variants.test.mjs
```

Result: exit code 0. Exact Node test count: 20 total, 20 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo. The brief's earlier expected count is 11; the current bundled suite contains 20 passing tests.

## HTTP Checks

All five requested URLs returned HTTP 200 (5/5):

| URL | Status |
| --- | --- |
| `http://127.0.0.1:4173/index.html` | 200 |
| `http://127.0.0.1:4173/index.html?hero=a` | 200 |
| `http://127.0.0.1:4173/index.html?hero=b` | 200 |
| `http://127.0.0.1:4173/index.html?hero=c` | 200 |
| `http://127.0.0.1:4173/index.html?hero=z` | 200 |

## UI/UX Pro Max Guidance

The prescribed UX query returned guidance to respect reduced motion, maintain at least 8px touch spacing, and use touch-sized responsive controls. The live implementation uses a 10px CTA gap, 44px CTA height, and a 44px mobile version-link minimum width.

## Fresh Static Audit

| Requirement | Result | Evidence |
| --- | --- | --- |
| Approved colors, Roboto, 5px rhythm, and 5px/10px radii | PASS | `styles.css` defines the required tokens, `--grid-unit: 5px`, and local Roboto faces. |
| Navigation order | PASS | Primary-nav DOM order is Home, Build, Play, Version A, Version B, Version C. |
| Default and invalid hero handling | PASS | `normalizeHeroVersion()` accepts only `a`, `b`, `c`; missing or invalid values return `a`. |
| Shareable hero states and one active state | PASS (static) | Query links exist for A/B/C; setup assigns one `aria-current` link and one visible panel. |
| Desktop/mobile version labels and accessible names | PASS | Desktop text is Version A/B/C; at <=768px `.version-word` is hidden while `aria-label="Version X"` remains. |
| Hero CTA labels, destinations, colors, targets, and spacing | PASS (static) | Each panel has Start Creating -> `build.html` and Play -> `play.html`; CTA height is 44px and gap is 10px. |
| Version-link 44px interaction area | PASS | `.nav-version` has 44px minimum height and, at <=768px, 44px minimum width. |
| Mobile header overlap prevention | PASS (static) | `.nav-theme { display: none; }` at <=480px; sign-in is also hidden at <=768px. |
| Focus styling | PASS (static) | Shared `:focus-visible` rule supplies a 2px accent outline with a 3px offset. |
| Inactive accessibility/media lifecycle | PASS | Inactive panels use native `hidden`; all videos begin with `data-src`; setup clears every source, then assigns `src` only to the active normal-motion video. |
| Reduced motion and live preference changes | PASS (static and tests) | Initial reduced motion avoids source/observer setup. Live `MediaQueryList` changes clear and restore only the active source, disconnect/recreate the observer, and remove the prior modern or legacy change listener during repeated setup; behavior tests cover the source/observer/listener lifecycle. |
| Offscreen media lifecycle | PASS (static and tests) | IntersectionObserver pauses an offscreen active video and attempts playback on re-entry; behavior test covers pause/rejected playback. |
| Reserved media and tall-desktop Build cue | PASS (static) | Hero media has explicit sizing; the tall-desktop hero cap is now 600px. |
| Level Lab mark repair | PASS (static) | The SVG declares `xmlns`, uses the fixed `#e5e5e5` fill, and `index.html` references `level-lab-mark.svg?v=2` at 20px by 20px. |
| Build, Play, Grow, Trust, and footer unchanged | PASS | Compared the current downstream markup from the Build section through the footer against `.superpowers/sdd/snapshots/task-2-before-index.html`: exact match, 11,071 characters in each file slice. |

Static audit count: 15 PASS, 0 FAIL, 0 UNVERIFIED.

## Parent-Session Browser Evidence

The following was performed by the parent session, not by this sidecar:

- Variants A, B, and C were inspected at 1440x900, 1024x768, 768x1024, and 375x812.
- Every inspected state had one current link and one visible panel, correct CTA URLs/colors, a 10px CTA gap, loaded nonblank video with `readyState` 4, and no horizontal overflow.
- At 375px, every A/B/C link measured 44px by 44px. The theme control was `display: none`, and the header did not overlap.
- At 1440px, the Build eyebrow began around 817px and its heading around 845px, above the fixed footer top at 860px.
- In a real browser, the active video paused after the hero scrolled offscreen and was playing in view with `readyState` 4.
- Version B passed light-theme browser verification: its fixed light foreground remained readable over the dark video scrim.
- `?hero=z` selected Version A. The console warning/error log was empty.
- The repaired Level Lab mark rendered at 20px by 20px.

## Strict-Gate Residual Limitation

The in-app browser could not drive actual native Tab-key traversal or OS-level reduced-motion emulation. Static focus rules and automated behavior tests cover these paths, but they do not complete the strict Task 4 gate. Manual native verification of focus traversal/visible rings and OS-emulated reduced-motion playback, or an explicit owner waiver, is still required.

## Whole-Work Changed-Files Checkpoint

No Git repository exists, so this is a documented hero-variant workset rather than a VCS-derived diff. The reported changed/created files across the work are:

- `C:\Users\diann\Music\Level Lab Grey Project\index.html`
- `C:\Users\diann\Music\Level Lab Grey Project\styles.css`
- `C:\Users\diann\Music\Level Lab Grey Project\hero-variants.mjs`
- `C:\Users\diann\Music\Level Lab Grey Project\tests\site.test.mjs`
- `C:\Users\diann\Music\Level Lab Grey Project\tests\hero-variants.test.mjs`
- `C:\Users\diann\Music\Level Lab Grey Project\assets\icons\level-lab-mark.svg`
- `C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\.superpowers\sdd\progress.md`
- `C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\.superpowers\sdd\task-1-brief.md` through `task-4-brief.md`
- `C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\.superpowers\sdd\task-1-report.md` through `task-4-report.md`
- `C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\docs\superpowers\specs\2026-07-13-level-lab-hero-variants-design.md`
- `C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\.superpowers\sdd\snapshots\task-2-before-index.html` and related Task 1-3 snapshot evidence

## Checkpoint

- Automated suite: 20/20 passing, 0 failing.
- HTTP status: 5/5 requested URLs returned 200.
- Static audit: 15 PASS, 0 FAIL, 0 UNVERIFIED.
- Strict Task 4 gate: PENDING manual native Tab traversal and OS-level reduced-motion verification, or owner waiver.
- Target changes by this sidecar: none. Report updated at `C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\.superpowers\sdd\task-4-report.md`.
