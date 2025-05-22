
-- This is a SQL migration file for reference. You'll need to run these commands in the Supabase SQL editor.

-- Create shipping_addresses table
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Zimbabwe',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for shipping_addresses
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own addresses
CREATE POLICY "Users can view their own addresses"
  ON public.shipping_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
  ON public.shipping_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON public.shipping_addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON public.shipping_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add shipping_address_id to orders table
ALTER TABLE public.orders
ADD COLUMN shipping_address_id UUID REFERENCES public.shipping_addresses(id);
