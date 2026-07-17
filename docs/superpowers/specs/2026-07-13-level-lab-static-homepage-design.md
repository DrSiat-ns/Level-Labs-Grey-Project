# Level Lab Static Homepage Design

## Goal

Create a pixel-faithful, responsive, interactive reproduction of the current
`https://stage.levellab.com/` homepage. The result is a self-contained design
prototype that opens directly from this folder without a server, package
installation, build step, backend, or connection to Level Lab's internal
systems.

The current staging homepage is the before-state baseline. Its wording, visual
layout, media treatment, and interaction model remain unchanged in this first
milestone, including media areas that currently look empty or unfinished.

## Audience And Product Context

Level Lab serves users of all ages, with a particular focus on young people.
The broader product supports three user types: beginners who need guidance,
players who want immediate games, and creators who want to build or remix.
Those product goals inform later work but do not change the staging homepage in
this exact-copy milestone.

## Scope

The prototype includes:

- An exact homepage reproduction in `index.html`.
- Responsive desktop, tablet, and mobile layouts.
- The staging homepage's navigation, section scrolling, calls to action,
  hover/focus states, and lightweight motion.
- Local placeholder destinations for Build, Play, and Sign In.
- Local copies of all required visual assets.
- Relative links so every page works when opened through the `file://` protocol.

The prototype excludes:

- Real authentication, accounts, sessions, or guardianship flows.
- The real game builder, game browser, remix system, or learning platform.
- Databases, APIs, analytics, moderation, or Level Lab internal code.
- Package managers, application frameworks, or a local development server.
- Product or content improvements to the staging homepage.

## File Structure

```text
Level Labs Grey Project/
|-- index.html
|-- build.html
|-- play.html
|-- sign-in.html
|-- styles.css
|-- script.js
`-- assets/
    |-- images/
    |-- media/
    `-- icons/
```

`index.html` contains semantic page content. `styles.css` owns the Level Lab
tokens, page layout, responsive behavior, states, and motion. `script.js` is
limited to behavior that HTML and CSS cannot provide cleanly, such as enhanced
scroll handling or media fallback state. The three destination pages are
visually consistent placeholders with a clear way back to the homepage.

## Homepage Structure

The homepage mirrors the staging page in this order:

1. Header with Home, Build, and Play navigation plus the Level Lab identity and
   Sign In action where it appears at the corresponding breakpoint.
2. Hero introducing "Build. Play. Grow. Trust." with its current supporting
   copy, benefit list, media area, and "Scroll to Learn More" action.
3. Build section with the existing "Build the experience" content and Start
   Building action.
4. Play section with the existing "Play is just the beginning" content and
   Explore Games action.
5. Grow section with the existing "Games grow. So do you." content and three
   growth themes.
6. Trust section with the existing "Safe by design" content and four safety
   themes.
7. Footer with the existing EULA, Privacy, and social destinations.

All copy, order, and visible media treatment are taken from the current staging
homepage rather than rewritten.

## Visual System

The public Level Lab style guide is the source of truth. The implementation
uses its dark theme and 5px grid rather than substituting a generic design
system.

Core tokens include:

- Background: `#1a1a1a`
- Surface: `#252525`
- Surface light and border: `#3a3a3a`
- Mid neutral: `#8c8c8c`
- Light text: `#e5e5e5`
- Secondary text: `#c5c5c5`
- Accent: `#0077ff`
- Error: `#ff3366`
- Success: `#00cc66`
- Warning: `#ff8800`
- Primary typeface: Roboto, with light body copy and stronger heading weights
- Spacing: multiples of 5px
- Small radius: 5px
- Large radius: 10px

The exact staging-page values take precedence where they differ from the
general style guide.

## Interaction Behavior

- Home returns to `index.html` and the top of the page.
- Build navigation and Start Building open `build.html`.
- Play navigation and Explore Games open `play.html`.
- Sign In opens `sign-in.html`.
- "Scroll to Learn More" moves to the Build section with smooth scrolling when
  motion is allowed and immediate scrolling when reduced motion is requested.
- Buttons, links, and icon controls preserve the staging site's visible hover,
  active, and focus behavior without changing layout dimensions.
- Placeholder destinations state only that the section will be designed later;
  they do not simulate real product functionality.

## Responsive Behavior

The homepage is matched and verified at 375px, 768px, 1024px, 1280px, and
1440px widths. Content reflows without horizontal scrolling, text overlap, or
fixed-width clipping. Media keeps a stable aspect ratio. Navigation adapts to
the available width while preserving the staging site's hierarchy and all
primary destinations.

Touch targets are at least 44px. Text remains readable when browser text size
is increased, and long text wraps instead of being silently truncated.

## Accessibility

- Semantic landmarks and a logical heading hierarchy.
- Keyboard access to every control in visual order.
- Visible focus treatment based on the Level Lab accent.
- Descriptive alternative text for meaningful imagery and empty alternative
  text for decorative media.
- No action communicated by color alone.
- `prefers-reduced-motion` support for scrolling and transitions.
- Contrast checked against WCAG AA, while preserving source fidelity wherever
  the staging page already meets it.

## Asset And Error Handling

All required homepage assets are stored locally. HTML media elements reserve
their dimensions before loading to avoid layout shift. If an asset cannot load,
the same dark media surface remains visible so the page structure does not
collapse or expose a broken-image icon. External social links remain external;
all design-prototype navigation remains local.

## Verification

Verification is performed by opening `index.html` directly and checking:

- Visual comparison with the staging homepage at 1280x720 and 1440px desktop.
- Responsive comparison at 375px mobile and 768px tablet.
- Every local navigation destination and return path.
- Section scrolling, button states, keyboard order, and focus visibility.
- Reduced-motion behavior.
- Missing-media fallback behavior.
- Browser console errors and accidental external application dependencies.

## Acceptance Criteria

The milestone is complete when:

1. `index.html` opens directly from the project folder with no setup.
2. The homepage closely matches the current staging page in structure, spacing,
   color, typography, copy, media treatment, and responsive behavior.
3. Build, Play, and Sign In lead to styled local placeholders.
4. No internal Level Lab service or real product functionality is included.
5. The page remains usable by keyboard and at the required responsive widths.
6. All required assets are present inside the project folder.
