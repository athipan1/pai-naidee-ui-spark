import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Resolve path to .env file at the root of the project
dotenv.config({ path: path.resolve(process.cwd(), '.env') });


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
  throw new Error('Supabase URL or Service Role Key is not set in environment variables.');
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const email = 'admin@example.com';
  const password = 'password';

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Automatically confirm the email
  });

  if (error) {
    console.error('Error creating admin user:', error.message);
    return;
  }

  console.log('Admin user created successfully:', data);
}

createAdminUser();
