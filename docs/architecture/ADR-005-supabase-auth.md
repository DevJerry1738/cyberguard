# ADR-005: Supabase Auth for User Authentication & RBAC

## Date
2026-07-01

## Status
Accepted

## Context
Implementing custom authentication flows (signup validation, email confirmations, session management, secure cookies, and password resets) is time-consuming and carries high security risk.

## Decision
Use Supabase Auth to manage signups, credentials verification, password resets, and session tokens. Roles and permissions will be mapped into the database schema and linked to auth identities.

## Alternatives Considered
- **NextAuth.js (Auth.js)**: Strong client integration, but requires custom database adapter management and lacks built-in transactional transactional transactional transactional SMTP mail senders.
- **Custom JWT Backend**: Reintroducing custom authorization middleware (e.g. NestJS), which contradicts our goal of simplifying our architecture.

## Reasoning
Supabase Auth is fully integrated with Postgres, updating JWT signatures automatically which are consumed directly by our RLS engines.

## Consequences
- **Positive**: Instant support for Email/Password, Magic Links, MFA, and OAuth providers. Highly secure JWT generation.
- **Negative**: Session lifecycle depends on Supabase API speed. Custom user creation hooks require triggers inside the database.
