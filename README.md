# CyberGuard

CyberGuard is a web-based Cybersecurity Compliance & Risk Assessment Platform designed to help organizations evaluate, monitor, and improve their cybersecurity compliance posture.

## Features (Planned)
- **Security Assessments**: Guide teams through compliance questionnaires (SOC 2, ISO 27001).
- **Risk Scoring & Mitigation**: Dynamically compute risk scores and link recommendations to mitigate risks.
- **Audit Logs & Alerts**: Maintain clear, audit-ready operational records.
- **Compliance Dashboards**: High-fidelity overview of current organization compliance standings.

---

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: NestJS, Swagger
- **Database**: PostgreSQL, Prisma ORM
- **Infrastructure**: Docker, pnpm Workspaces, GitHub Actions
- **Quality Assurance**: ESLint, Prettier, Commitlint, Husky, lint-staged

---

## Monorepo Directory Structure

```
cyberguard/
├── apps/
│   ├── web/                     # Next.js Frontend
│   └── api/                     # NestJS Backend API
├── packages/
│   ├── database/                # Prisma schemas and database module
│   ├── ui/                      # Shared UI Component Library stub
│   ├── types/                   # Shared TypeScript models and interfaces
│   └── config/                  # Shared configurations (Linting, Styling)
├── docs/                        # Architectural documents & ADRs
├── docker/                      # Postgres & pgAdmin docker-compose
└── .github/                     # CI workflows
```

---

## Development Setup

### Prerequisites
- Node.js v20+
- pnpm v11+
- Docker & Docker Compose

### 1. Installation
Install workspace dependencies:
```bash
pnpm install
```

### 2. Environment Variables
Configure environments. Example configurations are stored inside:
- [apps/api/.env](file:///c:/Users/jerem/cyberguard/apps/api/.env)
- [apps/web/.env.local](file:///c:/Users/jerem/cyberguard/apps/web/.env.local)

### 3. Spin up Database Services
Run PostgreSQL and pgAdmin via Docker:
```bash
docker compose -f docker/docker-compose.yml up -d
```

### 4. Running the Applications
Start frontend and backend locally in parallel:
```bash
pnpm dev
```
- Frontend will be hosted at `http://localhost:3000`
- Backend API will be hosted at `http://localhost:3001`
- Swagger documentation is available at `http://localhost:3001/api/docs`

---

## Architecture decisions (ADRs)
Documentation on architectural choices can be reviewed at:
- [ADR-001: Monorepo Setup](file:///c:/Users/jerem/cyberguard/docs/architecture/ADR-001-monorepo.md)
- [ADR-002: Next.js Frontend](file:///c:/Users/jerem/cyberguard/docs/architecture/ADR-002-nextjs.md)
- [ADR-003: NestJS Backend](file:///c:/Users/jerem/cyberguard/docs/architecture/ADR-003-nestjs.md)
- [ADR-004: PostgreSQL](file:///c:/Users/jerem/cyberguard/docs/architecture/ADR-004-postgresql.md)
- [ADR-005: Prisma ORM](file:///c:/Users/jerem/cyberguard/docs/architecture/ADR-005-prisma.md)
