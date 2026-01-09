The project is a npm package published on GitHub Package as @metanull/appscan-client. End-users install the package globally and invoke  'appscan' (a binary in the package); Developers build and invoke the app locally (`npm run build`, `node dist/index.js`). The app provides a TUI frontend and CLI commands. TUI and CLI share features via utilities and services; it avoids code deduplication and facilitates maintenance and evolution.

## Instruction Guidelines

### User requests

The requesters are normally, but not always right. If a request does not make sense to you, ask for more clarification. If you do not agree that a request improves the code, then you should explain why and ask for confirmation before implementing.

Addressing requests:
- You should only address the request provided not make unrelated changes
- Make your changes as simple as possible and avoid adding excessive code. If you see an opportunity to simplify, take it. Less is more.
- You should always change all instances of the same issue the request was about in the changed code.
- Provide feedback to the user if you think that the code could be improved, explaining what could be improved and why. But do not make the changes unless explicitly requested.
- You must not make assumptions on how third party code works, if there is a doubt you must verify the documentation and you may create a small test script to verify.

### Code Generation Guidelines

#### Coding standards

- Use JavaScript with ES2022 features and Node.js (20+) ESM modules
- Use Node.js built-in modules and avoid external dependencies where possible
- Ask the user if you require any additional dependencies before adding them
- Always use async/await for asynchronous code, and use 'node:util' promisify function to avoid callbacks. But do not overuse async/await only use it when necessary
- Keep the code simple and maintainable
- Use descriptive variable and function names
- Only add comment that explain nonobvious code. Do not add comments unless absolutely necessary, the code should be self-explanatory.
- Do not add comments describing the user requests, the use instructions; or comments describing what has changed in the codebase.
- Never use null, always use undefined for optional values
- Prefer functions over classes
- Functions should do one thing only and be small
- Use JSDoc for all functions

#### Testing

- Use Vitest for testing
- Write tests for all new features and bug fixes
- Ensure tests cover edge cases and error handling
- Do not test the framework or third party libraries, test the business logic only
- Use mocking and stubbing to isolate the code under test
- NEVER change the original code to make it easier to test, instead, write tests that cover the original code as it is

#### User interactions

- Ask questions if you are unsure about the implementation details, design choices, or need clarification on the requirements
- Always answer in the same language as the question, but use english for the generated content like code, comments or docs
- Always provide direct feedback to the user, do not create summary documents or reports unless explicitly requested


### TUI Rules

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

**References:**

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
