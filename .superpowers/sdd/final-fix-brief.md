# Final Review Fix Brief

## Finding

Add focused assertions for the approved responsive capability-divider behavior in `tests/site.test.mjs`.

The required assertions must protect:

1. Desktop: `.capability-item + .capability-item` uses `border-left: 1px solid var(--color-core-dark)`.
2. At `max-width: 900px`: `.capability-item:nth-child(odd)` resets `border-left: 0`, and `.capability-item:nth-child(n + 3)` uses `border-top: 1px solid var(--color-core-dark)`.
3. At `max-width: 560px`: `.capability-item + .capability-item` uses `border-top: 1px solid var(--color-core-dark)` and resets `border-left: 0`.

## Scope

- Modify only `tests/site.test.mjs`.
- Do not modify production CSS, HTML, JavaScript, or the live preview.
- Add assertions to the existing capability responsive test or the fixed-dark inner-grid test; do not create redundant markup tests.
- Use regex assertions consistent with the surrounding test style.
- Prove the assertions are meaningful with a temporary mutation: change one divider declaration in `styles.css`, run the focused site test and observe the new assertion fail, then restore `styles.css` exactly before final verification.
- Run the focused site test and the complete suite after restoration.
- Final expected count: 31 tests, all passing.
- Do not use Git operations.
