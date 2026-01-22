import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export async function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build time
    return createMockClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Admin client with service role key for server-side operations
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return createMockClient();
  }

  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}

// Mock client for when Supabase is not configured
function createMockClient() {
  const mockError = new Error('Supabase not configured');
  const mockResponse = { data: null, error: mockError };
  const mockChain = {
    select: () => mockChain,
    insert: () => mockChain,
    update: () => mockChain,
    delete: () => mockChain,
    upsert: () => mockChain,
    eq: () => mockChain,
    neq: () => mockChain,
    gt: () => mockChain,
    gte: () => mockChain,
    lt: () => mockChain,
    lte: () => mockChain,
    single: () => Promise.resolve(mockResponse),
    maybeSingle: () => Promise.resolve(mockResponse),
    then: (resolve: (value: typeof mockResponse) => void) => Promise.resolve(mockResponse).then(resolve),
  };

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: mockError }),
      getSession: () => Promise.resolve({ data: { session: null }, error: mockError }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: mockError }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: mockError }),
      signOut: () => Promise.resolve({ error: mockError }),
      admin: {
        getUserById: () => Promise.resolve({ data: { user: null }, error: mockError }),
      },
    },
    from: () => mockChain,
    rpc: () => Promise.resolve(mockResponse),
  } as unknown as ReturnType<typeof createServerClient>;
}
