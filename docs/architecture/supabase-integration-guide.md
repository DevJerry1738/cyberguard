# Supabase Integration Guide

This guide describes how to configure, migrate, and run the Supabase backend services for local development and production.

---

## 1. Project Initialization & Local CLI

### 1.1. Prerequisites
Ensure you have the Supabase CLI installed on your machine:
```bash
# Install via npm globally
npm install -g supabase
```

### 1.2. Initialize local Supabase Configuration
Run this command from your project root:
```bash
supabase init
```
This generates a `supabase` configuration folder containing:
- `config.toml`: General database and services configs.
- `migrations/`: Folder to store SQL migration files.

---

## 2. Database Migrations & Schemas
To implement our tables and trigger functions:

### 2.1. Create local migrations file
```bash
supabase migration new init_cyberguard_schema
```
This creates a blank SQL migration file under `supabase/migrations/<timestamp>_init_cyberguard_schema.sql`.

### 2.2. Populate migration with schema
Write your SQL tables, indexes, constraints, and triggers inside that file. To run migrations locally:
```bash
supabase start
```
This boots Docker containers locally representing the Supabase environment (DB, Auth, Storage) and applies migrations automatically.

---

## 3. Storage Buckets Config
CyberGuard requires two storage buckets:

### 3.1. `evidence` (Private)
- **Purpose**: Upload and archive compliance evidence documents.
- **Access Rule**: Row Level Security (RLS) policies apply. Only members of the organization related to the assessment session can download/upload.

### 3.2. `reports` (Private)
- **Purpose**: Store generated PDF audit reports.
- **Access Rule**: Read access restricted to Owners, Admins, and Security Officers belonging to the tenant.

To create them programmatically, add this to a migration file:
```sql
insert into storage.buckets (id, name, public) 
values ('evidence', 'evidence', false), ('reports', 'reports', false);
```
