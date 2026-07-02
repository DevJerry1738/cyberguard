# Case Study: Building CyberGuard - Migrating to Next.js + Supabase

This document serves as a technical case study detailing the architectural migration, security models, and design decisions of CyberGuard.

---

## 1. Executive Overview
- **Project Name**: CyberGuard
- **Concept**: Cybersecurity Compliance & Risk Assessment SaaS
- **Core Technology Stack**: Next.js 15, React 19, Supabase (PostgreSQL, Auth, Storage, RLS), Tailwind CSS.

---

## 2. Business Problem & Solution Design
Security compliance is often managed using disorganized spreadsheets. As a result, businesses struggle to maintain continuous security posture visibility, leading to delayed audits and higher risk exposure.

We designed a unified, continuous monitoring platform. Organizations can instantiate compliance frameworks, delegate tasks across departments, upload proof evidence, and compute threat metrics.

---

## 3. The Migration: Why We Moved to Serverless Supabase
Originally, CyberGuard was designed using a Next.js frontend, NestJS backend API, and a local PostgreSQL database using Prisma ORM.

### 3.1. Architectural Differences
- **Monorepo Architecture (Old)**: Next.js and NestJS require separate deployment environments, Docker setups for databases, and manual Prisma client generation.
- **Serverless Architecture (New)**: Exposes database operations directly to the Next.js client via Supabase client SDKs, with tenant isolation managed directly by Postgres Row Level Security (RLS).

---

## 4. Database & Isolation Design
The migration resulted in a normalized, 18-table Postgres schema detailing tenant relationships.
- Tenant isolation is enforced using Postgres RLS policies, preventing cross-organization data leakage.
- Database triggers automate user profile creation immediately after Supabase Auth user registration, syncing user details automatically.

---

## 5. Lessons Learned & Future Directions
- **Key Takeaways**: Integrating RLS policies simplifies application logic, removing redundant backend checks and boosting development speed.
- **Vendor Lock-in**: Direct reliance on Supabase Auth and RLS requires keeping SQL queries aligned with Supabase standards.
- **Next Steps**: Implementing automated compliance scanning (Sprint 8) and AI-driven recommendations reviews (Sprint 9).
