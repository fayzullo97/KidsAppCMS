import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey)
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : new Proxy({} as any, {
        get(_, prop) {
            return () => {
                throw new Error(
                    `Supabase Admin client failed to initialize: SUPABASE_SERVICE_ROLE_KEY is missing. ` +
                    `Attempted to access: ${String(prop)}. Please check your Vercel Environment Variables.`
                );
            };
        }
    });
