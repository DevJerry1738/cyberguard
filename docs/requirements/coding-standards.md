# Coding Standards & Git Strategy

## Git Branching Strategy
We use the Git Flow model simplified for continuous integration.

```
main        <- Production deployment (Protected, tag releases)
  ▲
release/*   <- Release candidate branches
  ▲
develop     <- Development staging (Protected, integration updates)
  ▲
feature/*   <- Dev branches (Created from develop, merged via PRs)
  ▲
hotfix/*    <- Hotfixes applied directly to main & develop
```

### Commit Messages (Conventional Commits)
Commits must conform to the Conventional Commits specification:
```
<type>(<scope>): <subject>

[optional body]
```
Allowed types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation updates
- `style`: Changes that do not affect the meaning of the code (formatting)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Build steps, dependencies, or repository configurations

*Example:* `feat(auth): add email verification routing callback`

---

## Coding Standards

### TypeScript
- Explicitly declare return types for Server Actions, custom React hooks, and utility functions.
- Enable `strict` checks in `tsconfig.json`.
- Do not use `any`. Use `unknown` if a type cannot be inferred.

### Next.js & React (Next.js 15 & React 19)
- By default, use **React Server Components** for pages and fetch data directly from Supabase.
- Use **Client Components** (`"use client"`) only when there is user interaction, browser-state hooks, or dynamic event listeners.
- Component file names must use PascalCase (e.g., `AssessmentCard.tsx`).
- Use feature-sliced organization inside `src/features/<feature-name>/`.

### Data Layer & Supabase
- Perform database mutations using **Next.js Server Actions**.
- Always handle Supabase return parameters with validation checks:
  ```typescript
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    // Implement structured error logs / user responses
    throw new Error(error.message);
  }
  ```
- All client-side input payloads passed to Server Actions must be validated using `zod` schemas.

