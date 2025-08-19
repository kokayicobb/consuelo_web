-- Create email_signups table for storing waitlist emails
CREATE TABLE IF NOT EXISTS email_signups (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON email_signups(email);

-- Add an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_email_signups_created_at ON email_signups(created_at);

-- Disable Row Level Security for completely public access
ALTER TABLE email_signups DISABLE ROW LEVEL SECURITY;