require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL missing in .env!');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function main() {
  try {
    console.log('⚡ Connected to Supabase PostgreSQL database.');
    console.log('📖 Reading database schema from database.sql...');
    
    // Read the database.sql file
    const sqlPath = path.join(__dirname, '..', 'database.sql');
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Remove instructions or remarks that might cause SQL execution issues
    // We execute the raw DDL queries
    console.log('🔨 Executing schema DDL and table creations...');
    await pool.query(sqlContent);
    console.log('✅ Schema initialized successfully!');

    // Inject correct password hashes
    console.log('🌱 Injecting Admin and Marketing User credentials...');
    
    // Delete any old overlapping records
    await pool.query("DELETE FROM users WHERE email IN ('admin@booqasho.com', 'marketing@booqasho.com')");

    // Insert Admin
    const adminQuery = `
      INSERT INTO users (id, full_name, email, phone, role, department, password_hash, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const adminValues = [
      'd3b07384-d113-4ec2-a5d9-4828691512f4',
      'Ayaanle Mohamed',
      'admin@booqasho.com',
      '+252615123456',
      'admin',
      'Marketing Management',
      '$2a$10$3jnsHPTa7UIE3IfI64g3xep/R4jxt3/fk1Y/XtF//BWKQG021aqVW',
      true
    ];
    await pool.query(adminQuery, adminValues);

    // Insert Marketing
    const marketingQuery = `
      INSERT INTO users (id, full_name, email, phone, role, department, password_hash, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const marketingValues = [
      'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      'Fahad Omar',
      'marketing@booqasho.com',
      '+252615778899',
      'marketing',
      'Field Marketing',
      '$2a$10$8ayp/CAXa8pKd7vZO0eiwezekJ3AATSQnSbktrd05M.yoDCW68R7q',
      true
    ];
    await pool.query(marketingQuery, marketingValues);

    console.log('🎉 Seeding completed successfully!');
    console.log('👤 Admin: admin@booqasho.com / admin123');
    console.log('👤 Marketing: marketing@booqasho.com / marketing123');

  } catch (err) {
    console.error('❌ Error executing database script:', err.message || err);
  } finally {
    await pool.end();
  }
}

main();
