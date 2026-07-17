# Level Lab Shared Welcome Hero Implementation Plan

**Goal:** Apply the approved shared Welcome message and fix the unframed, uncropped media treatment in Versions A and C.

**Architecture:** Keep the existing static HTML and URL-driven variant controller. Add small presentation modifiers to the A/C markup, then scope normal-flow and 16:9 media rules to those modifiers so Version B retains its background-video composition.

## Tasks

1. Update `tests/site.test.mjs` to require the exact shared message in each variant and the A/C unframed, full-media modifiers.
2. Run the focused tests and confirm they fail because the approved revision is not implemented yet.
3. Update `index.html` with the shared copy and A/C presentation modifiers.
4. Update `styles.css` so the outer shell is visually transparent, Version B retains its framed background, and A/C videos use natural 16:9 dimensions with `object-fit: contain`.
5. Run all automated tests, verify local assets and URLs, then inspect A/B/C on desktop and mobile in the in-app browser.
6. Copy only the verified changed website files to `C:\Users\diann\Music\Level Lab Grey Project`.

