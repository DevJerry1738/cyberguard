const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'));
  return match ? match[1] : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function runTests() {
  console.log('--- START EPIC 9 ASSESSMENT TEMPLATES DB INTEGRATION TESTS ---');

  // 1. Get an existing organization and profile to seed test data
  const { data: orgs, error: orgError } = await supabase.from('organizations').select('id').limit(1);
  if (orgError || !orgs || orgs.length === 0) {
    console.error('No organization found to run tests against. Create an organization first.', orgError);
    process.exit(1);
  }
  const orgId = orgs[0].id;
  console.log(`Using Organization ID: ${orgId}`);

  const { data: profiles, error: profileError } = await supabase.from('profiles').select('id').eq('organization_id', orgId).limit(1);
  if (profileError || !profiles || profiles.length === 0) {
    console.error('No profile found in organization.', profileError);
    process.exit(1);
  }
  const profileId = profiles[0].id;
  console.log(`Using Profile ID: ${profileId}`);

  // 2. Clean up any previous test templates
  console.log('Cleaning up previous test templates...');
  await supabase.from('assessment_templates').delete().eq('organization_id', orgId).ilike('name', 'Test %');

  // Get active security domains
  const { data: domains, error: domainError } = await supabase
    .from('security_domains')
    .select('id, name')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .limit(2);

  if (domainError || !domains || domains.length === 0) {
    console.warn('Warning: No active security domains found. Seed domains first or check RLS.');
  } else {
    console.log(`Found active domains for testing: ${domains.map(d => d.name).join(', ')}`);
  }

  // 3. Test: Name and version constraint validation (e.g. invalid semantic version format)
  console.log('\nTesting version semantic check constraint...');
  const { error: invalidVersionErr } = await supabase.from('assessment_templates').insert({
    organization_id: orgId,
    name: 'Test Constraint Template',
    framework: 'SOC 2',
    version: '1.0', // Invalid, must be MAJOR.MINOR.PATCH
    status: 'Draft',
    created_by: profileId
  });

  if (invalidVersionErr) {
    console.log('✅ Correctly blocked invalid version semantic format: ' + invalidVersionErr.message);
  } else {
    console.error('❌ Failed: Invalid version format was inserted successfully!');
  }

  // 4. Test: Insert valid template
  console.log('\nTesting valid draft template insertion...');
  const { data: template1, error: template1Err } = await supabase.from('assessment_templates').insert({
    organization_id: orgId,
    name: 'Test Template Family',
    framework: 'SOC 2',
    version: '1.0.0',
    status: 'Draft',
    created_by: profileId,
    updated_by: profileId
  }).select().single();

  if (template1Err) {
    console.error('❌ Failed to insert valid template:', template1Err);
  } else {
    console.log(`✅ Success: Inserted template "${template1.name}" v${template1.version} ID: ${template1.id}`);
  }

  // 5. Test: Name + Version uniqueness constraint
  console.log('\nTesting uniqueness of (name, version) per organization...');
  const { error: duplicateErr } = await supabase.from('assessment_templates').insert({
    organization_id: orgId,
    name: 'Test Template Family',
    framework: 'SOC 2',
    version: '1.0.0', // Duplicate of template1
    status: 'Draft',
    created_by: profileId
  });

  if (duplicateErr) {
    console.log('✅ Correctly blocked duplicate name + version: ' + duplicateErr.message);
  } else {
    console.error('❌ Failed: Duplicate template (same name and version) was allowed!');
  }

  // 6. Test: Family Active version constraint (Only one active version per family)
  // Let's create template2 as a child of template1 (same family)
  console.log('\nTesting only one active template per family...');
  const { data: template2, error: template2Err } = await supabase.from('assessment_templates').insert({
    organization_id: orgId,
    name: 'Test Template Family v2',
    framework: 'SOC 2',
    version: '2.0.0',
    status: 'Draft',
    parent_template_id: template1.id,
    root_template_id: template1.id,
    created_by: profileId,
    updated_by: profileId
  }).select().single();

  if (template2Err) {
    console.error('Failed to insert second template in family:', template2Err);
  } else {
    // Activate template1
    const { error: act1Err } = await supabase.from('assessment_templates').update({ status: 'Active' }).eq('id', template1.id);
    if (act1Err) {
      console.error('Failed to activate template 1:', act1Err);
    } else {
      console.log('Activated template 1 successfully.');
    }

    // Now try to activate template2 without archiving template1
    const { error: act2Err } = await supabase.from('assessment_templates').update({ status: 'Active' }).eq('id', template2.id);
    if (act2Err) {
      console.log('✅ Correctly blocked multiple active templates in the same family: ' + act2Err.message);
    } else {
      console.error('❌ Failed: Allowed multiple active templates in the same family!');
    }
  }

  // 7. Clean up
  console.log('\nCleaning up tests...');
  await supabase.from('assessment_templates').delete().eq('organization_id', orgId).ilike('name', 'Test %');
  console.log('Tests completed.');
}

runTests().catch(err => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
