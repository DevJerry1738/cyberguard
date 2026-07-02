# ADR-003: Supabase Backend Integration

## Date
2026-07-01

## Status
Accepted

## Context
With NestJS removed, we need a secure, managed database layer that exposes a direct client interface while enforcing access guidelines without an intermediate middleware API layer.

## Decision
Use Supabase as our unified backend database layer. Next.js connects directly to Supabase using client and server clients from `@supabase/ssr`.

## Alternatives Considered
- **Firebase**: Relies on NoSQL databases which complicate structural relational assessments and risk weighting calculations.
- **Hasura on AWS RDS**: Great GraphQL layer, but introduces high infrastructure management complexity compared to Supabase's all-in-one suite.

## Reasoning
Supabase provides built-in relational features (PostgreSQL), JWT-based user management (GoTrue), object storage for compliance reporting, and a serverless Postgres access model.

## Consequences
- **Positive**: Less code to write, unified console, native connection scaling, and automatic schema metadata generation.
- **Negative**: Data migrations require Supabase CLI setups, and vendor dependence is increased.
