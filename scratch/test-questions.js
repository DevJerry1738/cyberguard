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
  console.log('--- START EPIC 10 ENTERPRISE QUESTION BUILDER DB TESTS ---');

  // 1. Get organization and profile
  const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
  if (!orgs || orgs.length === 0) {
    console.error('No organization found.');
    process.exit(1);
  }
  const orgId = orgs[0].id;

  const { data: profiles } = await supabase.from('profiles').select('id').eq('organization_id', orgId).limit(1);
  if (!profiles || profiles.length === 0) {
    console.error('No profile found.');
    process.exit(1);
  }
  const profileId = profiles[0].id;

  // 2. Clean up previous test questions
  console.log('Cleaning up previous test data...');
  const { data: oldTemplates } = await supabase
    .from('assessment_templates')
    .select('id')
    .eq('organization_id', orgId)
    .ilike('name', 'Test Epic 10 %');

  if (oldTemplates && oldTemplates.length > 0) {
    const ids = oldTemplates.map(t => t.id);
    await supabase.from('assessment_questions').delete().in('template_id', ids);
    await supabase.from('assessment_templates').delete().in('id', ids);
  }

  // 3. Get domain
  const { data: domains } = await supabase
    .from('security_domains')
    .select('id')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .limit(1);

  if (!domains || domains.length === 0) {
    console.error('No security domain found. Please seed security domains first.');
    process.exit(1);
  }
  const domainId = domains[0].id;

  // 4. Create Draft template
  const { data: template, error: tErr } = await supabase
    .from('assessment_templates')
    .insert({
      organization_id: orgId,
      name: 'Test Epic 10 Template',
      framework: 'SOC 2',
      version: '1.0.0',
      status: 'Draft',
      created_by: profileId,
      updated_by: profileId
    })
    .select()
    .single();

  if (tErr) {
    console.error('Failed to create test template', tErr);
    process.exit(1);
  }

  console.log(`Created test draft template ID: ${template.id}`);

  // 5. Test 1: Insert Question check constraint validation (weight and type)
  console.log('\nTesting check constraint for weight < 1...');
  const { error: weightErr } = await supabase
    .from('assessment_questions')
    .insert({
      organization_id: orgId,
      template_id: template.id,
      domain_id: domainId,
      question_text: 'Is risk management evaluated regularly?',
      question_type: 'yes_no',
      weight: 0, // Invalid, check weight >= 1
      created_by: profileId
    });

  if (weightErr) {
    console.log('✅ Correctly blocked invalid weight: ' + weightErr.message);
  } else {
    console.error('❌ Failed: Saved question with weight < 1 successfully.');
  }

  console.log('\nTesting check constraint for invalid question type...');
  const { error: typeErr } = await supabase
    .from('assessment_questions')
    .insert({
      organization_id: orgId,
      template_id: template.id,
      domain_id: domainId,
      question_text: 'Is risk management evaluated regularly?',
      question_type: 'invalid_type', // Invalid enum check
      created_by: profileId
    });

  if (typeErr) {
    console.log('✅ Correctly blocked invalid question type: ' + typeErr.message);
  } else {
    console.error('❌ Failed: Saved question with invalid type successfully.');
  }

  // 6. Test 2: Insert valid questions
  console.log('\nTesting valid question insertion...');
  const { data: q1, error: q1Err } = await supabase
    .from('assessment_questions')
    .insert({
      organization_id: orgId,
      template_id: template.id,
      domain_id: domainId,
      question_text: 'MFA requirement checklist',
      question_type: 'yes_no',
      weight: 3,
      sort_order: 0,
      created_by: profileId
    })
    .select()
    .single();

  if (q1Err) {
    console.error('❌ Failed: ' + q1Err.message);
  } else {
    console.log(`✅ Success: Inserted question "${q1.question_text}" with ID: ${q1.id}`);
  }

  const { data: q2, error: q2Err } = await supabase
    .from('assessment_questions')
    .insert({
      organization_id: orgId,
      template_id: template.id,
      domain_id: domainId,
      question_text: 'Which environments have logging enabled?',
      question_type: 'multiple_choice',
      weight: 5,
      sort_order: 1,
      created_by: profileId
    })
    .select()
    .single();

  if (q2Err) {
    console.error('❌ Failed: ' + q2Err.message);
  } else {
    console.log(`✅ Success: Inserted question "${q2.question_text}" with ID: ${q2.id}`);
  }

  // 7. Test 3: Insert options for Multiple Choice
  console.log('\nTesting valid options insertion...');
  const { data: opts, error: optsErr } = await supabase
    .from('assessment_question_options')
    .insert([
      { question_id: q2.id, label: 'Production Only', value: 'prod', sort_order: 0 },
      { question_id: q2.id, label: 'Staging & Production', value: 'stage_prod', sort_order: 1 },
      { question_id: q2.id, label: 'All environments', value: 'all', sort_order: 2 }
    ])
    .select();

  if (optsErr) {
    console.error('❌ Failed options insert: ' + optsErr.message);
  } else {
    console.log(`✅ Success: Inserted ${opts.length} options for question.`);
  }

  // 8. Test 4: Soft delete
  console.log('\nTesting soft delete question...');
  const { error: deleteErr } = await supabase
    .from('assessment_questions')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: profileId
    })
    .eq('id', q1.id);

  if (deleteErr) {
    console.error('❌ Failed to soft delete: ' + deleteErr.message);
  } else {
    // Verify soft deleted is filtered
    const { data: verifyQ } = await supabase
      .from('assessment_questions')
      .select('id, deleted_at')
      .eq('id', q1.id)
      .single();

    if (verifyQ && verifyQ.deleted_at) {
      console.log('✅ Success: Question successfully soft deleted.');
    } else {
      console.error('❌ Failed: Question is not soft deleted or deleted_at is null.');
    }
  }

  console.log('\n--- TESTS COMPLETED ---');
}

runTests();
