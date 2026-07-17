# Task 3 Report: URL Selection and Video Lifecycle

## Status

Implemented Task 3 in the assigned files only:

- `hero-variants.mjs`
- `tests/hero-variants.test.mjs`
- `tests/site.test.mjs`
- `.superpowers/sdd/task-3-report.md`

## TDD Record

### RED

Command:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\hero-variants.test.mjs
```

Exact output:

```text
node:internal/modules/esm/resolve:275
    throw new ERR_MODULE_NOT_FOUND(
          ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\hero-variants.mjs' imported from C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\tests\hero-variants.test.mjs
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:865:10)
    at defaultResolve (node:internal/modules/esm/resolve:991:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:719:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:736:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:765:52)
    at #resolve (node:internal/modules/esm/loader:701:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:621:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:160:33)
    at ModuleJob.link (node:internal/modules/esm/module_job:245:17) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/diann/OneDrive/Documents/Level%20Labs%20Grey%20Project/hero-variants.mjs'
}

Node.js v24.14.0
✖ tests\hero-variants.test.mjs (59.8362ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 65.3929

✖ failing tests:

test at tests\hero-variants.test.mjs:1:1
✖ tests\hero-variants.test.mjs (59.8362ms)
  'test failed'
```

The expected failure was `ERR_MODULE_NOT_FOUND` for the not-yet-created controller module.

### GREEN

Command:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\site.test.mjs tests\hero-variants.test.mjs
```

Exact output:

```text
✔ hero query accepts a, b, and c (0.5405ms)
✔ hero query defaults unsupported and missing values to a (0.0863ms)
✔ the homepage is a self-contained static entry point (4.7232ms)
✔ homepage preserves the staging information architecture (0.9738ms)
✔ homepage exposes three shareable hero versions and defaults to A (2.3261ms)
✔ each hero version keeps the approved actions and accessible labels (0.6185ms)
✔ primary actions use local destinations (0.4823ms)
✔ styles preserve Level Lab tokens and required responsive states (0.9429ms)
✔ local destination pages are present and return home (1.2607ms)
✔ homepage behavior is progressively enhanced (0.6538ms)
✔ required visual assets are local (3.3003ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 83.0129
```

## Behavior Checkpoint

- `normalizeHeroVersion` accepts only lowercase `a`, `b`, and `c`; missing, unrelated, unsupported, and uppercase values return `a`.
- The selected panel alone has `hidden = false`; all other panels are hidden from rendering and the accessibility tree.
- The selected version link alone receives both `.active` and `aria-current="page"`; inactive links have `aria-current` removed.
- Only the active video's `data-src` is assigned to `src`, and only when reduced motion is not requested. Inactive videos are never assigned sources by the controller.
- Reduced motion returns before observer setup and leaves the active video at its poster with no assigned `src`.
- When `IntersectionObserver` is available, visibility starts playback and loss of visibility pauses it. When unavailable, setup returns safely without throwing.
- The module is safe to import in Node because automatic setup is guarded by `typeof document !== "undefined"`; the Node unit tests import it directly.

## Static Contract Extension

The existing progressive-enhancement test now confirms `hero-variants.mjs` contains:

- `URLSearchParams`
- `data-hero-panel`
- `data-hero-video`
- `IntersectionObserver`
- `prefers-reduced-motion`

## Self-Review

- Kept scope to the four files assigned to Task 3.
- Created the normalization test before production code and captured the specified missing-module RED result.
- Used the required browser integration hooks already supplied by the static homepage work; no changes were made to `index.html`, `styles.css`, `script.js`, or other tests.
- Avoided top-level `document` or `window` reads during module import.
- Added the minimal `IntersectionObserver` availability guard required for older or constrained browser environments.

## Concerns

No known functional concerns. The automated checks are unit and static-contract tests; browser playback and intersection callbacks are not exercised by a browser automation test in this task.

## Review Revision: Lifecycle Cleanup And Behavior Tests

### Command Availability

The requested commands were attempted first:

```powershell
node --test tests\hero-variants.test.mjs
node --test tests\*.test.mjs
```

`node` is not available on this machine's PATH. PowerShell returned:

```text
node : The term 'node' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

The existing project Node runtime was used for the equivalent commands below.

### RED

Command:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\hero-variants.test.mjs
```

Result: `8` tests total, `4` passed, `4` failed, exit code `1`.

The intended failures demonstrated the unimplemented review findings:

- duplicate matching links and panels produced `2 !== 1` active elements;
- inactive stale media retained `/stale-a.mp4` instead of clearing to an empty source;
- repeated normal setup did not disconnect its old observer (`0 !== 1`);
- reduced-motion setup after normal setup did not disconnect its old observer (`0 !== 1`).

### GREEN: Focused Lifecycle Tests

Command:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\hero-variants.test.mjs
```

Result: `8` tests total, `8` passed, `0` failed, exit code `0`.

The focused behavior tests cover single active panel/link selection, inactive source cleanup, repeated setup observer cleanup, reduced motion, unavailable observers, and swallowed playback rejection.

### GREEN: Complete Suite

Command:

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\*.test.mjs
```

Result: `17` tests total, `17` passed, `0` failed, exit code `0`.

### Changed Files In This Revision

- `hero-variants.mjs`
- `tests/hero-variants.test.mjs`
- `.superpowers/sdd/task-3-report.md`

`tests/site.test.mjs` was not changed in this revision because its existing progressive-enhancement contract remained valid.
