# Task 2 Brief

## Global Constraints
- Keep the existing four benefit titles, descriptions, and SVG icons unchanged.
- Keep one shared capability section outside the hero variants.
- Keep `Scroll to Learn More` centered above the band with visible separation.
- Use a full-width fixed dark surface in both themes with existing Level Lab core tokens.
- Use four equal columns above 900px, two columns from 561px through 900px, and one column at 560px and below.
- Preserve readable wrapping and prevent horizontal overflow at 320px.
- Do not add cards, shadows, gradients, animation, or JavaScript.
- Do not change hero media, CTAs, social proof, navigation, or later homepage sections.
- The prototype folder is not managed as a Git repository; omit commit commands.


### Task 2: Sync and Verify the Live Preview

**Files:**
- Copy: `styles.css` to `C:\Users\diann\Music\Level Lab Grey Project\styles.css`

**Interfaces:**
- Consumes: The tested capability-band CSS from Task 1.
- Produces: The updated local preview at `http://127.0.0.1:4173/index.html`.

- [ ] **Step 1: Sync the changed stylesheet**

Run:

```powershell
Copy-Item -LiteralPath 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\styles.css' -Destination 'C:\Users\diann\Music\Level Lab Grey Project\styles.css' -Force
```

- [ ] **Step 2: Verify the live server and stylesheet hash**

Run:

```powershell
$response = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/index.html?hero=a' -TimeoutSec 5
$response.StatusCode
Get-FileHash 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\styles.css','C:\Users\diann\Music\Level Lab Grey Project\styles.css'
```

Expected: HTTP `200` and matching SHA256 hashes.

- [ ] **Step 3: Inspect every hero version in the in-app browser**

Open and inspect:

```text
http://127.0.0.1:4173/index.html?hero=a
http://127.0.0.1:4173/index.html?hero=b
http://127.0.0.1:4173/index.html?hero=c
```

For each version, confirm the same dark band spans the viewport, the inner benefit grid remains centered, and the scroll cue has visible separation above it.

- [ ] **Step 4: Verify responsive and theme states**

Check `1051x898`, `768x900`, `375x812`, and `320x700`. Confirm the grid is four, two, one, and one columns respectively; the band reaches both viewport edges; all four items remain readable; and `document.documentElement.scrollWidth <= window.innerWidth`. Toggle light and dark themes and confirm the band colors remain fixed and readable.

- [ ] **Step 5: Run final verification**

Run:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\*.test.mjs
```

Expected: all 31 tests pass with zero failures after live-preview verification.

