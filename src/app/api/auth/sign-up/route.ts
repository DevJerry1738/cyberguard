import { NextResponse } from 'next/server';
import { RegisterSchema } from '@/features/auth/schemas/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = RegisterSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({ field: String(issue.path[0] ?? ''), message: issue.message }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: parseResult.data.email,
      password: parseResult.data.password,
      options: {
        data: {
          first_name: parseResult.data.firstName,
          last_name: parseResult.data.lastName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
