import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { OnboardingSchema } from '@/features/onboarding/schemas/onboarding';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate body
    const body = await req.json();
    const parse = OnboardingSchema.safeParse(body);
    if (!parse.success) {
      const errors = parse.error.issues.map(i => ({ field: String(i.path[0] ?? ''), message: i.message }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }
    const data = parse.data;

    // 3. Service role client for RLS bypass during initialization
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // 4. Idempotency check
    const { data: profile } = await admin
      .from('profiles')
      .select('onboarding_complete, organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.onboarding_complete) {
      return NextResponse.json({ success: false, message: 'Onboarding already complete' }, { status: 409 });
    }

    // 5. Create organization
    const slug = data.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({ name: data.organizationName, slug })
      .select('id')
      .single();
    if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`);

    // 6. Update profile
    const { error: profileError } = await admin
      .from('profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        job_title: data.jobTitle,
        phone: data.phone ?? null,
        organization_id: org.id,
        onboarding_complete: true,
      })
      .eq('id', user.id);
    if (profileError) throw new Error(`Failed to update profile: ${profileError.message}`);

    // 7. Get Owner role id
    const { data: ownerRole } = await admin
      .from('roles')
      .select('id')
      .eq('name', 'Owner')
      .single();

    // 8. Create membership
    const { error: memberError } = await admin
      .from('organization_members')
      .insert({
        organization_id: org.id,
        profile_id: user.id,
        role_id: ownerRole?.id ?? null,
      });
    if (memberError) throw new Error(`Failed to create membership: ${memberError.message}`);

    // 9. Organization settings
    const { error: settingsError } = await admin
      .from('organization_settings')
      .insert({
        organization_id: org.id,
        industry: data.industry,
        company_size: data.companySize,
        country: data.country,
        timezone: data.timezone,
      });
    if (settingsError) throw new Error(`Failed to create org settings: ${settingsError.message}`);

    // 10. Audit log
    await admin.from('audit_logs').insert({
      organization_id: org.id,
      profile_id: user.id,
      action: 'onboarding.complete',
      details: {
        organization_name: data.organizationName,
        industry: data.industry,
        company_size: data.companySize,
        country: data.country,
      },
    });

    return NextResponse.json({ success: true, organizationId: org.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
