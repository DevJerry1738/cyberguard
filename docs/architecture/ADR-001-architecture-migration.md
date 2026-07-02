# ADR-001: Architecture Migration - Next.js + Supabase

## Date
2026-07-01

## Status
Accepted

## Context
The previous architecture used a monorepo setup consisting of a Next.js frontend, a NestJS backend API, a Prisma ORM database client, and docker-compose configurations for running Postgres locally. This was complex to maintain, deploy, and scale for a growing startup team. We need a simpler, highly scalable, and secure architecture.

## Decision
We will migrate the architecture to a single unified Next.js 15 (App Router) project deployed on Vercel, using Supabase as our complete backend-as-a-service (Database, Auth, Storage, and RLS). NestJS, Prisma, Docker, and the monorepo configuration will be removed.

## Alternatives Considered
- **Keep NestJS + Prisma + Docker**: Solid, but introduces high operational maintenance overhead for database provisioning, authentication logic, middleware, and scaling Docker containers.

## Reasoning
- **Simplicity**: No separate backend codebase. Next.js Server Actions and route handlers process server-side transactions easily.
- **Velocity**: Supabase eliminates the need to build auth, storage, and database connectors from scratch.
- **Cost**: Serverless deployment via Vercel + Supabase scales down to zero when idle and scales infinitely under load.

## Consequences
- **Positive**: Immediate developer deployment loop on Vercel, out-of-the-box JWT authentication, and fine-grained access control via Postgres Row Level Security.
- **Negative**: Hard vendor lock-in to Supabase features (such as RLS and Auth metadata).
