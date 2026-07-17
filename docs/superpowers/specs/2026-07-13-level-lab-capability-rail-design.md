# Level Lab Capability Rail Design

**Status:** Approved concept, awaiting written-spec review.

## Purpose

Add a compact benefits section directly after the active hero and before the existing Build section. The section explains Level Lab's core advantages without copying the supplied reference composition or competing with the hero.

The rail is shared by Versions A, B, and C. Changing the hero URL changes only the hero presentation; the rail remains the same.

## Content

The section contains these four items in this order:

1. **AI-assisted creation**  
   Describe what you want, and watch it appear.
2. **No coding required**  
   Every tool works by pointing, dragging, and talking.
3. **You stay in control**  
   Accept, tweak, or undo anything the AI suggests.
4. **Publish and play**  
   Share your game with one click, right in the browser.

## Visual Direction

Use a single unframed horizontal band aligned to the existing Level Lab content width. The rail does not use four cards and does not reproduce the light dotted reference design.

- Preserve the existing dark or light page background and Level Lab grid.
- Use a thin top and bottom border to define the band.
- Divide desktop items with subtle vertical hairlines.
- Place each icon in a stable 40px square using the existing 5px spacing rhythm, surface color, border token, and small radius.
- Use the blue accent for icons only; titles use the main text color and descriptions use the secondary text color.
- Keep typography compact and work-focused: bold item titles, 16px descriptions, and comfortable line height.
- Add no hover animation because the items are informational, not interactive.

## Icons

Use four consistent outline icons:

- `Sparkles` for AI-assisted creation
- `Code2` for no coding required
- `SlidersHorizontal` for staying in control
- `Check` for publish and play

Icons are local inline SVGs, decorative, and hidden from assistive technology. No external icon or network dependency is introduced.

## Structure And Accessibility

Use a semantic section with an accessible `Why Level Lab` label and a list containing four list items. Each item contains one decorative icon, one heading, and one paragraph. The visible design does not need an additional section headline.

The content remains readable without CSS. Keyboard behavior is unchanged because the rail contains no controls or links.

## Responsive Behavior

- Desktop: four equal columns in one row.
- Tablet: two columns by two rows, with dividers adjusted to the grid.
- Phone: one item per row with horizontal separators and no vertical divider.
- At 320px, all text and icons stay inside the viewport without horizontal scrolling.

## Implementation Boundaries

- Add the section to `index.html` between `#welcome` and `#build`.
- Add scoped rail styles to `styles.css` using existing Level Lab tokens.
- Do not change hero switching, hero layouts, the Build section, navigation, or JavaScript.
- Do not add packages, remote assets, or a build step.

## Verification

- Automated checks confirm all four titles and descriptions, exactly four icons, semantic list structure, and placement between Welcome and Build.
- Responsive checks cover four-column, two-column, and one-column layouts.
- Browser inspection covers desktop and 320px phone widths, dark and light themes, text fit, divider behavior, and horizontal overflow.

