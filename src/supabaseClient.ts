import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	// Provide a helpful runtime error if env vars are missing — this surfaces in the browser console
	throw new Error(
		'Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set and the dev server was restarted.'
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);