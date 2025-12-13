/**
 * Deprecated Database Module
 *
 * This file is kept for backwards compatibility only.
 * BUZZ MVP uses Supabase instead of direct PostgreSQL connections.
 *
 * All new code should import from @/lib/supabase
 * See website/lib/supabase.ts for the new Supabase client
 */

export async function query(text: string, params?: any[]) {
  throw new Error('Direct database queries are deprecated in BUZZ. Use Supabase client instead.');
}

export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  throw new Error('Direct database transactions are deprecated in BUZZ. Use Supabase client instead.');
}

export async function closeDb() {
  // No-op in BUZZ
}
