const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  );

  try {
    console.log('Connecting to Supabase...');

    // Check if table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Table does not exist, creating it...');
      console.log('\nPlease run this SQL in your Supabase SQL Editor:');
      console.log('Go to: https://app.supabase.com/project/flrdgekqzdolnddwtpmy/sql\n');
      console.log(`CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`);
      console.log('\nAfter running the SQL, the registration API will work!');
    } else {
      console.log('Users table already exists and is accessible!');
      console.log('Registration API is ready to use.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

setupDatabase();
