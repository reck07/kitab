import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mctauilwkicgxbeowyge.supabase.co';
const supabaseAnonKey = 'sb_publishable_wVHuwo40lZMCPmr5hAefRg_EVol_JJm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);