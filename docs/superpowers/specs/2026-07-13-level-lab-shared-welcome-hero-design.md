# Level Lab Shared Welcome Hero Revision

**Status:** Approved through the user's annotated Version A, B, and C feedback on 2026-07-13.

## Goal

Make the three hero concepts comparable by giving them one message, while correcting the cropped media and visible panel treatment called out in Versions A and C.

## Shared Content

Every hero version uses the same copy and actions:

- Eyebrow: `Welcome`
- Heading: `Build. Play. Grow. Trust.` with `Trust.` in the Level Lab accent color
- Lead: `Level Lab is an online platform where you can dream up your own games, remix your favorites, and share creations with your friends!`
- Primary action: `Start Creating`
- Secondary action: `Play`

The variants compare presentation, not messaging.

## Variant Treatment

- **Version A:** Centered copy above a browser-framed video. Remove the visible outer hero panel. Keep the browser frame, but let the video render at its full 16:9 ratio without cropping.
- **Version B:** Preserve the dark video-background composition and scrim. Change only its copy so it remains a useful layout comparison.
- **Version C:** Centered copy above the labeled video. Remove the visible outer hero panel. Let the video render at its full 16:9 ratio without cropping.

## Responsive And Accessibility Requirements

- Keep the existing 44px minimum action height and visible keyboard focus.
- Reserve video dimensions with `aspect-ratio` to prevent layout shift.
- Allow the unframed variants to grow naturally so the full video remains visible on desktop and mobile.
- Preserve one semantic `h1`, readable line lengths, lazy loading, reduced-motion behavior, and shareable `?hero=a|b|c` URLs.

