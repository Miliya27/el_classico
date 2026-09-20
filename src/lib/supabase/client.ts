import { createBrowserClient } from '@supabase/ssr';
import { getEnv } from '@/lib/env';
import type { Database } from '@/types/database';

export function createClient() {
  const { url, anonKey } = getEnv();
  return createBrowserClient<Database>(url, anonKey);
}
