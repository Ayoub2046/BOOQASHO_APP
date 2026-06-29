require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('🌱 Starting database seeding on Supabase...');

  // 1. Insert Admin
  const adminData = {
    id: 'd3b07384-d113-4ec2-a5d9-4828691512f4',
    full_name: 'Ayaanle Mohamed',
    email: 'admin@booqasho.com',
    phone: '+252615123456',
    role: 'admin',
    department: 'Marketing Management',
    password_hash: '$2a$10$3jnsHPTa7UIE3IfI64g3xep/R4jxt3/fk1Y/XtF//BWKQG021aqVW'
  };

  // 2. Insert Marketing User
  const marketingData = {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    full_name: 'Fahad Omar',
    email: 'marketing@booqasho.com',
    phone: '+252615778899',
    role: 'marketing',
    department: 'Field Marketing',
    password_hash: '$2a$10$8ayp/CAXa8pKd7vZO0eiwezekJ3AATSQnSbktrd05M.yoDCW68R7q'
  };

  try {
    // Delete existing if any to avoid conflicts
    await supabase.from('users').delete().in('email', ['admin@booqasho.com', 'marketing@booqasho.com']);

    const { data: insertedUsers, error: userError } = await supabase
      .from('users')
      .insert([adminData, marketingData])
      .select();

    if (userError) {
      throw userError;
    }

    console.log('✅ Seed successful! Users created:');
    console.log(insertedUsers.map(u => ({ email: u.email, role: u.role, is_verified: u.is_verified })));
  } catch (err) {
    console.error('❌ Seeding failed:', err.message || err);
  }
}

seed();
