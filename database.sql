-- Run this SQL in your Supabase SQL Editor
-- Go to: https://app.supabase.com/project/flrdgekqzdolnddwtpmy/sql

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify the table was created
SELECT * FROM users LIMIT 1;
