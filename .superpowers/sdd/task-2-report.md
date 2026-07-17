# Task 2 Report

## Status

DONE

## Sync Result

The controller completed the required protected-folder stylesheet sync before this verification resumed. No source CSS, HTML, JavaScript, or tests were edited during Task 2 verification.

## HTTP Status

`GET http://127.0.0.1:4173/index.html?hero=a` returned HTTP `200`.

## Source/Live SHA256 Comparison

Source and live stylesheet SHA256 values matched:

```text
A424CB4B3E72015767CDEE687C9A488529AB94A2DC4F9AEDDA74C8360AA18302
```

Source: `C:\Users\diann\OneDrive\Documents\Level Labs Grey Project\styles.css`

Live: `C:\Users\diann\Music\Level Lab Grey Project\styles.css`

## Live Responsive and Theme Verification

Inspected in the in-app browser at `http://127.0.0.1:4173/index.html?hero=a`, `?hero=b`, and `?hero=c`. Every result below was checked in both dark and light themes.

| Viewport | Heroes | Columns | Edge-to-edge band | Horizontal overflow | Copy readability | Scroll-cue separation | Theme contrast |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| 1051x898 | A / B / C | 4 | Pass | Pass | Pass: four visible items; 16px copy | Pass: 40px gap | Pass: fixed `rgb(26, 26, 26)` band; heading 13.82:1, copy 10.08:1 |
| 768x900 | A / B / C | 2 | Pass | Pass | Pass: four visible items; 16px copy | Pass: 41.96px to 45px gap | Pass: fixed `rgb(26, 26, 26)` band; heading 13.82:1, copy 10.08:1 |
| 375x812 | A / B / C | 1 | Pass | Pass | Pass: four visible items; 16px copy | Pass: 45px gap | Pass: fixed `rgb(26, 26, 26)` band; heading 13.82:1, copy 10.08:1 |
| 320x700 | A / B / C | 1 | Pass | Pass | Pass: four visible items; 16px copy | Pass: 45px gap | Pass: fixed `rgb(26, 26, 26)` band; heading 13.82:1, copy 10.08:1 |

For every hero/version and viewport, the grid remained centered, all four benefit items had nonzero visible bounds with no item overflow, and `document.documentElement.scrollWidth <= window.innerWidth` held. The theme was toggled through the live control, then restored to dark after verification.

## Final Test Command and Count

```powershell
& 'C:\Users\diann\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\*.test.mjs
```

Result: `31` tests passed; `0` failed, cancelled, skipped, or todo.

## Concerns

None. The in-app browser reports fractional rendered widths at some viewport sizes because of its scrollbar/viewport scaling, but the band began at x=0, filled the rendered page width, and no horizontal overflow was present in any required check.
