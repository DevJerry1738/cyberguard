# ADR-004: Row Level Security (RLS) for Multi-Tenant Isolation

## Date
2026-07-01

## Status
Accepted

## Context
Multi-tenancy isolation is a critical security requirement for CyberGuard. Organization A must never view compliance reports or assessments belonging to Organization B. Because Next.js calls Supabase directly, we need strict database-enforced security policies.

## Decision
Configure Postgres Row Level Security (RLS) on every table inside the database schema, restricting queries to the authenticated user's organization scope.

## Alternatives Considered
- **Application-Level Filtering**: Applying `WHERE organization_id = ...` clauses manually in Next.js. This is extremely error-prone and risks security leaks if a single developer forgets a filter query.

## Reasoning
Postgres RLS acts as a security guard at the database engine level. Even if Next.js makes an open query without parameters, Postgres automatically rejects records belonging to other tenants.

## Consequences
- **Positive**: Strict data isolation guarantees, simple client-side query structures, database-enforced security boundaries.
- **Negative**: Database writing and schema migration debug steps become more complex. Testing requires authenticated session mocking.
