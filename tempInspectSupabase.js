const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = {};
for (const line of envFile.split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  let value = line.slice(idx + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  const sessionId = 'cc306546-3eea-43ce-a5b5-3d974093909e';
  const sessionResp = await admin.from('assessment_sessions').select('*').eq('id', sessionId).maybeSingle();
  console.log('SESSION', JSON.stringify(sessionResp, null, 2));

  const assignmentResp = await admin.from('assessment_session_assignments').select('*').eq('session_id', sessionId);
  console.log('ASSIGNMENTS', JSON.stringify(assignmentResp, null, 2));

  const orgId = sessionResp.data?.organization_id;
  if (orgId) {
    const membersResp = await admin.from('organization_members').select('id, profile_id, roles(name), organization_id').eq('organization_id', orgId).limit(20);
    console.log('MEMBERS', JSON.stringify(membersResp, null, 2));
  }
})();