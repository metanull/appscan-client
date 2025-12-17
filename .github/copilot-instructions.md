AppScan client is both:
- a console Cli and 
- a React-based Terminal UI (TUI) application using **Ink** for terminal rendering and **Zustand** for state management.
Both provide similar feature

- Prefer pure functions and small components; use `useMemo` for expensive work.
- Zustand State Management - **Subscribe to individual state slices**, never to setters
- Preventing Infinite Loops - Never extract Zustand setters as component-level selector hooks. This breaks Zustand's subscription optimization and causes infinite render loops because setter function references change on every render. Instead:
  - Extract **data** selectors at component level (state values)
  - Use **`useStore.getState()`** for all state mutations inside effects/callbacks
  - Keep component effect dependencies minimal and data-focused
- Effect Dependencies 
  - Mount-only effects: Use empty `[]` dependency array and guard with `useRef`
  - Data-driven effects: Depend only on data, not on setter functions
- Memoization
  - Use `useMemo` for expensive computations (filtering, sorting)
  - Use `useCallback` for stable function references passed to children
  - Dependencies should be data primitives, not selectors
- Component Props & Memoization
  - Memoize all panel components with `React.memo`
  - Pass only necessary props, avoid spreading objects
  - Use stable callback references with `useCallback`
- Common Patterns
  - Loading Data on Mount
  - Avoid throttling/debouncing as workarounds for architectural issues

## References
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
