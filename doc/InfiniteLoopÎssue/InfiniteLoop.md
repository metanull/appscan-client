🎉 **The infinite loop is fixed!** The app is running and the UI is displaying correctly. The scan is loaded, the vulnerabilities panel shows 0 issues (because the selected scan has no issues), and all three panels are rendering properly.

The error at the end is just PowerShell trying to interpret the "a: App" help text as a command — not an application error. 

Completed: *Refactor InkApp effects to break infinite loop* (1/1)

## Summary: Infinite Loop Diagnosis & Fix ✅

**Root Causes Identified:**

1. **Zustand setter extraction at component level** — Each render created new function instances, causing dependency arrays to think dependencies changed, triggering effects repeatedly.
2. **Circular effect dependencies** — The app-loading effect depended on `view` from the store; when re-renders happened, `view` could appear to change, re-triggering the effect.
3. **Object creation in selectors** — The `filters` object was recreated on every render, even with `shallow` comparison, triggering dependent effects.
4. **useArticleCache setter dependency** — The hook extracted `setArticleCache` as a selector, making it a new reference each render, which cascaded to dependent hooks.

**Fixes Applied:**

1. ✅ **Split loading effects** — Separated app-loading (mount only) from auto-opening modal (data-driven)
2. ✅ **Removed setter selectors** — All calls now use `useStore.getState()` inside callbacks/effects
3. ✅ **Individual state subscriptions** — Subscribe to each filter individually instead of creating filter objects
4. ✅ **Guard refs** — Added `useRef` guards (`hasLoadedApps`, `hasOpenedAppModal`) to prevent effect re-runs
5. ✅ **Removed object dependencies** — Memoized filters using individual primitives instead of filter objects
