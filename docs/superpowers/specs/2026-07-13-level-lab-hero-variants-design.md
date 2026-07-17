# Level Lab Hero Variants Design

**Date:** 2026-07-13
**Status:** Approved

## Purpose

Add a temporary hero-comparison control to the existing static Level Lab homepage. This is a design test, not a permanent navigation feature.

## Navigation

The primary navigation order will be:

1. Home
2. Build
3. Play
4. Version A
5. Version B
6. Version C

The three version links appear directly after Play. Version A is active when the homepage is opened without a saved or URL-selected variant.

The active version uses the existing Level Lab active-navigation treatment. The inactive versions remain neutral. Each link has a minimum 44px interaction area and a visible keyboard focus state.

On narrow screens, the visible labels shorten to A, B, and C while retaining the full accessible names Version A, Version B, and Version C. This prevents the fixed header from overflowing while preserving the requested desktop labels.

## Switching Behavior

Selecting a version changes only the hero section. The Build, Play, Grow, Trust, and footer sections remain identical.

The selected version is represented in the URL with a query parameter:

- `index.html?hero=a`
- `index.html?hero=b`
- `index.html?hero=c`

Opening `index.html` without a query parameter displays Version A. An unsupported value also falls back to Version A. Standard links make each state refreshable, shareable, and functional without client-side storage.

## Shared Hero Foundation

All three versions follow the current Level Lab style guide:

- Background `#1a1a1a`
- Surface `#252525`
- Border `#3a3a3a`
- Primary text `#e5e5e5`
- Secondary text `#c5c5c5`
- Accent `#0077ff`
- Roboto typography
- 5px spacing rhythm and 5px/10px radii

All variants use the same two actions:

- **Start Creating:** blue primary button linking to `build.html`
- **Play:** neutral secondary button linking to `play.html`

Buttons are at least 44px tall, use visible focus states, and preserve an 8px or larger gap. The primary button uses a foreground color that meets WCAG AA contrast against the blue background.

The hero leaves a visible hint of the following Build section on desktop and mobile. Video does not obscure the headline or actions. Reduced-motion mode replaces autoplay motion with a still visual state, and video pauses when it is outside the visible area.

## Version A: Centered Stage

Version A is the default and most closely follows the supplied reference.

- Centered eyebrow, headline, supporting sentence, and CTA row
- Framed Level Lab video rises from the bottom and partially peeks into the first viewport
- Message and actions remain visually dominant above the video
- Proposed headline: **Make a game. Make it yours.**
- Proposed support: **Turn an idea into a playable 3D game, then remix every piece until it feels like you.**

## Version B: Video Canvas

Version B uses the hero video as a full-bleed background.

- Dark overlay maintains readable text and button contrast
- Copy sits over the video without being placed inside a card
- Motion is cinematic but restrained to one primary moving element
- Proposed headline: **Your idea. Playable in minutes.**
- Proposed support: **Create, play, and remix directly in your browser.**

## Version C: Builder Reveal

Version C is the cleanest, most product-led option.

- Centered copy and actions occupy the upper hero
- An unframed product video rises directly from the lower edge
- The media is visually connected to the page rather than presented as a browser window
- Proposed headline: **Imagine it. Build it. Remix everything.**
- Proposed support: **A real game-making workspace that grows with every idea.**

## Accessibility And Performance

- Sequential heading structure remains intact with one `h1` in the active hero
- Inactive hero content is not present in the accessibility tree
- CTA and navigation targets meet the 44px minimum
- Keyboard focus is visible and follows the navigation order
- Text meets WCAG AA contrast in dark and light themes
- The video is muted and inline when motion is allowed
- Reduced-motion mode disables autoplay and uses a stable fallback
- Only the active hero video is loaded
- The layout reserves media space to prevent content movement while loading

## Verification

Test all three URL states at desktop and mobile widths. Confirm:

- `index.html` defaults to Version A
- Each version link activates the correct hero and active navigation state
- Invalid hero parameters fall back to Version A
- Build and Play actions keep their destinations in every variant
- The rest of the homepage is unchanged between variants
- The header does not overflow at 375px, 768px, 1024px, and 1440px
- Keyboard navigation and reduced-motion behavior work in all variants
- No missing media, console errors, horizontal scrolling, or overlapping text
