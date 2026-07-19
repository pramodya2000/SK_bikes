-- =============================================
-- SK Bikes - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Create bikes table
CREATE TABLE bikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  "imageUrl" TEXT,
  "advancedDetails" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create helmets table
CREATE TABLE helmets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  "imageUrl" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
