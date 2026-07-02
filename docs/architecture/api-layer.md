# API Layer & Data Fetching Strategy

This document details the data fetching patterns, mutations, validations, and caching protocols used across Next.js 15 and Supabase.

---

## 1. Client Types & Usage

We leverage three distinct client profiles to connect with Supabase based on the rendering context:

### 1.1. Client Components (Browser Client)
Used inside client components (`"use client"`) for real-time listener bindings and interactive forms:
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data, error } = await supabase.from('organizations').select('*');
```

### 1.2. Server Components (Server Client)
Used inside server components and Route Handlers to fetch static layouts directly from PostgreSQL securely:
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data } = await supabase.from('assessment_sessions').select('*');
```

### 1.3. Service Role Client (Admin Client)
Used *only* in background tasks and admin scripts where Postgres RLS needs to be bypassed (e.g. user signup sync triggers, system metrics).
> [!CAUTION]
> Never import or expose the Service Role key or client inside client-side components or standard Server Actions.

---

## 2. Server Actions for Mutations

All user data modifications (Insert, Update, Delete) are performed using **Next.js Server Actions**. This ensures type-safety, removes the need for REST endpoints, and simplifies error handling.

### Example Action: Update Answer
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitResponse(sessionId: string, questionId: string, value: string) {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  // 2. Perform Database Mutation (RLS will automatically validate organization boundaries)
  const { data, error } = await supabase
    .from('responses')
    .upsert({
      session_id: sessionId,
      question_id: questionId,
      profile_id: user.id,
      value,
      updated_at: new Date().toISOString()
    });

  if (error) {
    return { success: false, error: error.message };
  }

  // 3. Revalidate path to refresh server component cache
  revalidatePath(`/assessments/session/${sessionId}`);
  return { success: true };
}
```

---

## 3. Data Fetching & Caching Strategy
- **React 19 Cache**: Page-level fetches use default Next.js fetch cache controls. Since Supabase requests use standard HTTP endpoints under the hood, we configure cache rules using Next.js config parameter keys.
- **On-Demand Revalidation**: `revalidatePath` and `revalidateTag` are used to purge caches immediately after Server Actions update database records, keeping views up to date without browser reloads.
- **Client Realtime**: If dashboard elements require real-time updates (e.g., active notifications), we hook into Supabase Realtime Channels using browser clients.
