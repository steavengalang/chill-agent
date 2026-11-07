---
name: chill-slop-code
description: "Comprehensive Pragmatic Senior Dev Code Standard. The smallest working diff wins. Native platform first, ruthless YAGNI minimalism, zero premature abstractions, clean comments without obvious filler or emojis."
license: MIT
---

# ChillSlop Code: Comprehensive Pragmatic Senior Dev Standard

> *"The best code is the code you never wrote. Every line added is an ongoing maintenance liability."*

---

## 1. The Shortest Working Diff Wins

- **Deletion Beats Addition:** Always prefer deleting dead code or simplifying an existing flow over writing new abstractions.
- **Scope Discipline:** Read the task and the surrounding code. List every place your change must touch: callers, tests, fixtures, config, database models, exports. Finish every part of that scope. Extra unrequested features are rejected.
- **Single-File Bias:** Keep closely related logic in the same module until size or distinct ownership forces separation. Splitting a 150-line utility into 6 micro-files is prohibited.

---

## 2. Ruthless YAGNI (You Aren't Gonna Need It)

Reject speculative engineering:
- **No Premature Factories or Builders:** If a class or object is only instantiated in one or two places, use a plain function or object literal.
- **No Speculative Config Toggles:** Do not add configuration flags, environment overrides, or plugin systems that nobody requested.
- **No Generic "For Later" Wrappers:** Do not wrap standard libraries or database clients in custom repository layers unless multiple backends are actively running today.

---

## 3. The Native Platform Ladder

Before reaching for an external npm dependency, climb down this ladder:

1. **Standard Library:**
   - Use `node:sqlite` instead of `better-sqlite3` or ORM bloat.
   - Use `node:crypto` instead of `crypto-js` or `uuid`.
   - Use `node:util` `parseArgs` instead of `commander` or `yargs`.
   - Use native `fetch` instead of `axios` or `node-fetch`.
2. **House Helpers:** Check if an existing function in the codebase already solves the sub-task.
3. **Existing Dependencies:** Use libraries already declared in `package.json`.
4. **New Dependency:** Permitted only when writing it from scratch requires non-trivial cryptographic math, complex hardware drivers, or hundreds of lines of verified parsing logic. Never install an npm package for 10 lines of code.

---

## 4. Bug Fix Protocol

1. **Grep Callers First:** Before altering any function signature or return type, grep every caller in the codebase.
2. **Fix Root Causes:** Fix the bug once in the shared core routine, rather than patching symptoms at each call site.
3. **Preserve Security & Boundaries:** Never remove input validation, sanitization, or permission checks during a refactor.

---

## 5. Comment Hygiene & Zero Emojis

### The "WHY" Rule
- **FORBIDDEN (Obvious WHAT comments):**
  ```typescript
  // Set count to 0
  let count = 0;

  // Check if user is logged in
  if (user.isLoggedIn) {
    // Redirect to dashboard
    router.push('/dashboard');
  }
  ```
- **REQUIRED (Non-obvious WHY comments):**
  ```typescript
  // WAL mode allows concurrent readers to query while the proxy daemon writes active step records
  db.exec('PRAGMA journal_mode = WAL;');
  ```

### The Zero Emoji Rule
Never insert emojis (`🚀`, `✨`, `🔥`, `💡`, `🎉`) into:
- Code comments
- Docstrings / JSDoc / TSDoc
- Console log messages
- Git commit messages

### The Explicit Shortcut Marker
If taking an intentional pragmatic shortcut to keep code minimal, document it with this exact format:
```typescript
// shortcut: <exact limit>, <trigger condition for upgrade>
// Example:
// shortcut: in-memory Set lookup limits active connections to ~50k concurrent sockets; switch to Redis cluster when scaling beyond single host
```

---

## 6. Lazy Self-Checks & Asserts

- **Trivial Code:** Simple field renames, CSS edits, and one-liners require no testing boilerplate.
- **Non-Trivial Code:** Any new algorithmic branch, parser, financial calculation, state machine, or security check must leave at least one compact assert or self-check verifying expected behavior against edge cases.
