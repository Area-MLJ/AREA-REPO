import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../logger';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  }
);

logger.info('Supabase client initialized');

export const db = {
  from: (table: string) => supabase.from(table),
  rpc: (functionName: string, params?: any) => supabase.rpc(functionName, params),
};

export default db;
export { supabase };
