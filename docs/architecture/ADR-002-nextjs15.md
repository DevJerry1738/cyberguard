# ADR-002: Next.js 15 App Router and React 19 Upgrade

## Date
2026-07-01

## Status
Accepted

## Context
We want to leverage the latest React 19 features (Actions API, compiler, improved hooks like `use`) and Next.js 15 capabilities (improved server-side rendering, caching dynamics, Server Components stability, and built-in Turbopack integration).

## Decision
Upgrade the frontend to Next.js 15 (App Router) and React 19.

## Alternatives Considered
- **React 18 & Next.js 14**: Maintain current versions. However, this delays our usage of critical Server Actions performance optimizations and upcoming React compiler tools.

## Reasoning
Next.js 15 simplifies data hydration and server-side actions, fitting seamlessly with `@supabase/ssr` to retrieve session-level parameters securely on the server.

## Consequences
- **Positive**: State-of-the-art UI processing speed, asynchronous actions hooks, and cleaner server-side loading state controls.
- **Negative**: React 19 library compatibility issues with older package dependencies (mitigated by using modern, vanilla Tailwind structures).
