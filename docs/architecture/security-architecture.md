# Security Architecture Guide

This document details the security model, compliance controls, and threat defenses built into CyberGuard.

---

## 1. Authentication & Session Security

### 1.1. Supabase Auth
Authentication is handled by Supabase Auth (GoTrue).
- Session tokens are structured as JWTs containing standard claims (email, metadata, UUID).
- **Session Transport**: Sessions are stored in secure, `HttpOnly`, `SameSite=Lax` cookies, preventing client-side scripts from reading tokens.
- **MFA (Multi-Factor Authentication)**: Enforced for administrative accounts using Time-based One-time Password (TOTP) protocols.

---

## 2. Multi-Tenant Authorization (RBAC & RLS)
Tenant isolation is enforced globally via database-level **Row Level Security (RLS)**.
- Authentication parameters (JWT payload claims) determine query context.
- Cross-tenant queries are blocked because database filters are applied directly in Postgres policies.
- Role-based permissions are read from `roles` and `permissions` tables, preventing regular users from accessing administrative tools.

---

## 3. Data Integrity & Threat Mitigation

### 3.1. SQL Injection Protection
- The Supabase JS Client translates actions into parameterized SQL statements automatically.
- Custom functions and migrations use Postgres's default parameterized query processors, mitigating SQL injection risks.

### 3.2. XSS & CSRF Protections
- **XSS (Cross-Site Scripting)**: React automatically escapes variables rendered in JSX, preventing HTML injection. Input validation schemas (Zod) strip HTML tokens.
- **CSRF (Cross-Site Request Forgery)**: Next.js Server Actions automatically validate request source origin.

### 3.3. HTTP Security Headers
The platform integrates standard security headers via `next.config.ts`:
```json
Referrer-Policy: "strict-origin-when-cross-origin"
X-Content-Type-Options: "nosniff"
X-Frame-Options: "DENY"
X-XSS-Protection: "1; mode=block"
Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co;"
```
