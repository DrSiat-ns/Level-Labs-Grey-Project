# Version D How Level Lab Works Panels

## Scope

Restyle only Version D's existing "How Level Lab Works" cards. Keep the current three steps, front and back copy, click/keyboard flip behavior, section heading, and DOM structure. Versions A, B, and C remain unchanged.

## Visual Design

- Use three equal-width editorial panels on desktop.
- Give each panel a 6px corner radius and a dark surface slightly lighter than the page background.
- Add a thin Level Lab blue accent across the top edge.
- Place the existing line icon at the top-left at a larger display size.
- Place `STEP 1`, `STEP 2`, or `STEP 3` at the top-right as a compact blue label.
- Keep the existing title and description beneath the icon area with left alignment and comfortable line length.
- Use Level Lab semantic color tokens for surfaces, text, borders, and accents.
- Avoid decorative gradients, heavy shadows, and new imagery.

## Interaction

- Preserve the existing click and keyboard flip interaction.
- Keep front and back faces the same dimensions to prevent layout shifts.
- Use a 240ms transform-based flip transition.
- Retain visible keyboard focus treatment and `aria-pressed` updates.
- Respect `prefers-reduced-motion` by removing the animated rotation while preserving the state change.

## Responsive Behavior

- Apply the editorial treatment only when Version D is active.
- Keep the existing three-column desktop layout.
- Stack cards into one column at the existing responsive breakpoint.
- Ensure step labels, icons, titles, and descriptions remain inside each card without overlap.

## Verification

- Confirm Version D shows the new panel treatment on all three cards.
- Confirm A, B, and C retain their current card design.
- Confirm all three cards flip by click and keyboard.
- Confirm the back copy is unchanged.
- Confirm reduced-motion behavior and mobile stacking remain functional.
