import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serverKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !serverKey) {
  throw new Error('Missing server-side Supabase configuration. Set SUPABASE_URL and SUPABASE_SECRET_KEY.');
}

if (!email || !password) {
  throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD. Refusing to use default admin credentials.');
}

if (password.length < 12) {
  throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
}

const supabase = createClient(supabaseUrl, serverKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      role: 'admin',
    },
  });

  if (error) {
    console.error('Failed to create admin user:', error.message);
    process.exitCode = 1;
    return;
  }

  console.log('Admin user created successfully:', {
    id: data.user?.id,
    email: data.user?.email,
    role: data.user?.app_metadata?.role,
  });
}

void createAdminUser();
