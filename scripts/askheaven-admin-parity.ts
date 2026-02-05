import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/types.ts';
import { runAskHeavenParityCheck } from '../src/lib/ask-heaven/admin-parity.ts';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const slug = process.argv[2] ?? process.env.ASK_HEAVEN_PARITY_SLUG;

if (!supabaseUrl || !serviceRoleKey || !slug) {
  console.error(
    'Missing required env. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and slug (arg or ASK_HEAVEN_PARITY_SLUG).'
  );
  process.exit(1);
}

const keyPrefix = serviceRoleKey.slice(0, 8);
let host = 'unknown';
try {
  host = new URL(supabaseUrl).host;
} catch {
  host = 'unknown';
}

const adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
  db: { schema: 'public' },
  global: {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const parity = await runAskHeavenParityCheck({
  slug,
  adminClient,
  supabaseUrl,
  serviceRoleKey,
});

console.log(
  `Ask Heaven admin parity (host=${host}, keyPrefix=${keyPrefix}, slug=${slug})`
);

const isParityOk = parity.supabaseJs.found === parity.rest.found;

if (isParityOk) {
  console.log('OK parity');
  process.exit(0);
}

console.log('Parity mismatch detected');
console.log(JSON.stringify(parity, null, 2));
process.exit(2);
