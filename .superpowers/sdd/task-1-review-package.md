# Task 1 Review Package

## Implementer Report

# Task 1 Report

## Status

DONE

## Files Changed

- `styles.css`
- `tests/site.test.mjs`
- `.superpowers/sdd/task-1-report.md`

## TDD Evidence

### Red

Exact command:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs
```

Result: exit code 1. The run had 21 tests, 19 passed, and 2 failed:

- `the capability rail is full width with a centered fixed-dark inner grid`: failed because `.capability-rail` still had `max-width: var(--width-content)` and the old theme-dependent framing.
- `the capability rail has breathing room below the hero without doubling mobile spacing`: failed because `.capability-rail` still used the old `margin: var(--space-4) auto 0` shorthand instead of the required `margin-top` declaration.

### Green and Full Suite

Focused green command:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs
```

Result: 21 tests, 21 passed, 0 failed, 0 cancelled, 0 skipped.

Exact full-suite command:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\*.test.mjs
```

Result: 31 tests, 31 passed, 0 failed, 0 cancelled, 0 skipped.

## Requirement Self-Review

- Existing four benefit titles, descriptions, and SVG icons remain unchanged.
- The shared capability section remains outside the hero variants.
- The existing centered `Scroll to Learn More` placement and separation are preserved; the rail retains the required top spacing declaration and existing compact-screen override.
- The rail is full width with a fixed `var(--color-core-darkest)` surface and core-token borders.
- The inner list remains centered at `var(--width-content)` with the required safe-area/content-gap width calculation.
- The responsive grid remains four equal columns above 900px, two columns through 900px, and one column at 560px and below.
- Item padding, icon framing, title color, description color, and divider colors use the exact required values.
- `min-width: 0`, the bounded grid tracks, and `overflow-wrap: anywhere` preserve readable wrapping and prevent horizontal overflow at the 320px minimum.
- No cards, shadows, gradients, animation, or JavaScript were added.
- Hero media, CTAs, social proof, navigation, and later homepage sections were not changed.
- The Music preview folder was not synchronized or modified.
- No commit, branch, reset, checkout, or clean operations were run.

## Concerns

None. Verification was performed with the required Node test suites; no browser visual check was requested in the brief.


## styles.css Diff

```diff
warning: in the working copy of '.superpowers\sdd\task-1-before-styles.css', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'styles.css', LF will be replaced by CRLF the next time Git touches it
diff --git "a/.superpowers\\sdd\\task-1-before-styles.css" b/styles.css
index 65d8046..0b77a22 100644
--- "a/.superpowers\\sdd\\task-1-before-styles.css"
+++ b/styles.css
@@ -439,18 +439,22 @@ body {
 }
 
 .capability-rail {
-  width: 100%;
-  max-width: var(--width-content);
-  margin: var(--space-4) auto 0;
-  border-top: 1px solid var(--color-border);
-  border-bottom: 1px solid var(--color-border);
-  background: color-mix(in srgb, var(--color-background) 82%, transparent);
+  width: auto;
+  max-width: none;
+  margin-top: var(--space-4);
+  margin-right: calc(-1 * (var(--content-gap) + var(--safe-area-right)));
+  margin-bottom: 0;
+  margin-left: calc(-1 * (var(--content-gap) + var(--safe-area-left)));
+  border-top: 1px solid var(--color-core-dark);
+  border-bottom: 1px solid var(--color-core-dark);
+  background: var(--color-core-darkest);
 }
 
 .capability-list {
   display: grid;
   grid-template-columns: repeat(4, minmax(0, 1fr));
-  margin: 0;
+  width: min(calc(100% - var(--content-gap) - var(--content-gap) - var(--safe-area-left) - var(--safe-area-right)), var(--width-content));
+  margin: 0 auto;
   padding: 0;
   list-style: none;
 }
@@ -461,11 +465,11 @@ body {
   align-items: start;
   gap: var(--space-3);
   min-width: 0;
-  padding: var(--space-5) var(--space-4);
+  padding: var(--space-5) clamp(var(--space-3), 2vw, var(--space-4));
 }
 
 .capability-item + .capability-item {
-  border-left: 1px solid var(--color-border);
+  border-left: 1px solid var(--color-core-dark);
 }
 
 .capability-icon {
@@ -473,10 +477,10 @@ body {
   place-items: center;
   width: 40px;
   height: 40px;
-  border: 1px solid var(--color-border);
+  border: 1px solid var(--color-core-dark);
   border-radius: var(--radius-sm);
-  background: var(--color-surface);
-  color: var(--color-accent-text);
+  background: var(--color-core-darker);
+  color: var(--color-accent-light);
 }
 
 .capability-icon svg {
@@ -490,7 +494,7 @@ body {
 
 .capability-title {
   margin: 0;
-  color: var(--color-text);
+  color: var(--color-core-lightest);
   font-size: 16px;
   line-height: 1.3;
   font-weight: var(--font-weight-bold);
@@ -499,7 +503,7 @@ body {
 
 .capability-description {
   margin: var(--space-1) 0 0;
-  color: var(--color-text-dark);
+  color: var(--color-core-light);
   font-size: 16px;
   line-height: 1.5;
   overflow-wrap: anywhere;
@@ -519,7 +523,7 @@ body {
   }
 
   .capability-item:nth-child(n + 3) {
-    border-top: 1px solid var(--color-border);
+    border-top: 1px solid var(--color-core-dark);
   }
 }
 
@@ -529,7 +533,7 @@ body {
   }
 
   .capability-item + .capability-item {
-    border-top: 1px solid var(--color-border);
+    border-top: 1px solid var(--color-core-dark);
     border-left: 0;
   }
 }
```

## tests/site.test.mjs Diff

```diff
warning: in the working copy of '.superpowers\sdd\task-1-before-site.test.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests\site.test.mjs', LF will be replaced by CRLF the next time Git touches it
diff --git "a/.superpowers\\sdd\\task-1-before-site.test.mjs" "b/tests\\site.test.mjs"
index e7e2163..e2ef02c 100644
--- "a/.superpowers\\sdd\\task-1-before-site.test.mjs"
+++ "b/tests\\site.test.mjs"
@@ -181,9 +181,26 @@ test("the capability rail uses the approved responsive grid", async () => {
   assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?\.capability-list\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
 });
 
+test("the capability rail is full width with a centered fixed-dark inner grid", async () => {
+  const css = await read("styles.css");
+
+  assert.match(
+    css,
+    /\.capability-rail\s*\{[^}]*max-width:\s*none[^}]*margin-right:\s*calc\(-1 \* \(var\(--content-gap\) \+ var\(--safe-area-right\)\)\)[^}]*margin-left:\s*calc\(-1 \* \(var\(--content-gap\) \+ var\(--safe-area-left\)\)\)[^}]*background:\s*var\(--color-core-darkest\)/s,
+  );
+  assert.match(
+    css,
+    /\.capability-list\s*\{[^}]*width:\s*min\(calc\(100% - var\(--content-gap\) - var\(--content-gap\) - var\(--safe-area-left\) - var\(--safe-area-right\)\),\s*var\(--width-content\)\)[^}]*margin:\s*0 auto/s,
+  );
+  assert.match(css, /\.capability-item\s*\{[^}]*padding:\s*var\(--space-5\) clamp\(var\(--space-3\),\s*2vw,\s*var\(--space-4\)\)/s);
+  assert.match(css, /\.capability-icon\s*\{[^}]*border:[^;]*var\(--color-core-dark\)[^}]*background:\s*var\(--color-core-darker\)[^}]*color:\s*var\(--color-accent-light\)/s);
+  assert.match(css, /\.capability-title\s*\{[^}]*color:\s*var\(--color-core-lightest\)/s);
+  assert.match(css, /\.capability-description\s*\{[^}]*color:\s*var\(--color-core-light\)/s);
+});
+
 test("the capability rail has breathing room below the hero without doubling mobile spacing", async () => {
   const css = await read("styles.css");
-  assert.match(css, /\.capability-rail\s*\{[^}]*margin:\s*var\(--space-4\)\s+auto\s+0/s);
+  assert.match(css, /\.capability-rail\s*\{[^}]*margin-top:\s*var\(--space-4\)/s);
   assert.match(
     css,
     /@media\s*\(max-height:\s*768px\),\s*\(max-width:\s*768px\)[\s\S]*?\.capability-rail\s*\{[^}]*margin-top:\s*0/s,
```

