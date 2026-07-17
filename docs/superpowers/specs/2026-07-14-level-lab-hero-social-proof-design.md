# Level Lab Hero Social Proof Design

## Goal

Add a compact community signal to the homepage hero so visitors can see that Level Lab is active and creator-driven before they reach the product video.

## Approved Direction

Use an unframed creator cluster directly beneath the hero CTA row in Versions A, B, and C. The element contains five overlapping fictional creator avatars, a small green activity dot, and the prototype copy:

> 879 creators active this week

The count is prototype content. It must remain isolated in the markup so real activity data can replace it later without changing the layout.

## Visual Treatment

- Position the cluster 15px below the CTA row and center it within the hero copy.
- Use five 28px circular illustrated avatars with an 8px overlap, stored as local SVG assets.
- Use fictional, game-like creator identities rather than photos of real young people.
- Give each avatar a 1px surface-colored ring so overlapping faces remain legible.
- Keep the treatment flat and unframed. Do not add a pill, card, shadow, or decorative glow.
- Set the supporting copy at 14px, with `879` in bold.
- Use the Level Lab success token for the activity dot and theme text tokens for the copy.
- Keep the row order explicit: avatar cluster, activity copy, then the green activity dot.
- Preserve the fixed light foreground treatment in Version B because its copy sits over a dark video scrim.

## Responsive Behavior

- Keep avatars and copy on one centered row when they fit.
- At narrow phone widths, allow the copy to wrap while keeping the avatar group intact.
- The element must not change the CTA button widths or cause horizontal overflow at 320px.

## Accessibility

- Expose the cluster as a short creator-activity statement.
- Treat the fictional avatars and activity dot as decorative.
- Do not rely on the green dot alone; the activity state is also written in text.
- Preserve the existing hero heading and CTA reading order.

## Verification

- Confirm the proof appears once in every hero version.
- Confirm the exact prototype copy is present and readable.
- Check dark and light themes, including Version B's fixed scrim colors.
- Check desktop, tablet, and 320px phone layouts for wrapping and overflow.
- Run the complete homepage test suite after implementation.
