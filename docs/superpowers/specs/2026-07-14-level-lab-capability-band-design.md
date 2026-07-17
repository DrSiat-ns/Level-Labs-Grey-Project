# Level Lab Adaptive Capability Band Design

## Goal

Restyle the four-benefit section beneath the hero as a full-width capability band that feels consistent with the Level Lab design system and appears identically after hero Versions A, B, and C.

## Approved Direction

Use a balanced adaptive grid. The band spans the viewport, while its four benefit items remain centered within the existing content width. The treatment stays flat and restrained: no cards, shadows, gradients, or decorative containers.

## Structure

- Keep the existing four approved benefits and SVG icons unchanged.
- Keep one shared capability section outside the hero variants so every version receives the same treatment.
- Keep the `Scroll to Learn More` cue centered above the band with a visible gap.
- Use the existing Level Lab semantic color, typography, spacing, border, and radius tokens.

## Desktop Layout

- The band background and top/bottom borders extend across the full viewport.
- The inner list is centered and capped at `var(--width-content)`.
- Display four equal-width columns.
- Each item uses a 40px icon column and a flexible copy column.
- Use consistent item padding and vertical dividers between adjacent benefits.
- Align icons and headings at the top so scanning remains predictable.

## Responsive Layout

- Above 900px: four equal columns.
- From 561px through 900px: two columns by two rows.
- At 560px and below: one item per row.
- Replace obsolete vertical dividers with horizontal row dividers as the grid collapses.
- Preserve readable text wrapping without truncation or horizontal scrolling at 320px.
- Keep icons at a stable size so reflow does not shift the layout unexpectedly.

## Visual Treatment

- Use a solid or token-mixed dark surface that remains visually distinct from the hero background.
- Keep the band flat and unframed beyond its top and bottom separators.
- Use the existing blue accent for the line icons.
- Use bold benefit titles and secondary body text with accessible contrast in both themes.
- Preserve the existing compact, work-focused rhythm rather than turning each benefit into a card.

## Accessibility

- Retain semantic list markup and heading order.
- Keep decorative icons hidden from assistive technology.
- Maintain at least 4.5:1 contrast for normal text and visible separators in both themes.
- Do not rely on color alone to distinguish the four benefits.
- The section introduces no new interactive controls or animation.

## Verification

- Confirm the same capability band appears after Versions A, B, and C.
- Check layouts at 1051x898, 768x900, 375x812, and 320x700.
- Confirm the grid changes from four columns to two and then one.
- Confirm there is no horizontal overflow, text clipping, or incoherent overlap.
- Check dark and light themes.
- Preserve all existing homepage tests and add focused tests for full-width framing and responsive dividers.

## Non-Goals

- Do not change the approved benefit copy or icons.
- Do not create separate capability markup for each hero version.
- Do not alter hero media, CTAs, social proof, navigation, or sections below the capability band.
