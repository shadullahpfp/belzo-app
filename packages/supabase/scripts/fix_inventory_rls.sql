-- =============================================================================
-- BELZO HYPERLOCAL QUICK-COMMERCE ECOSYSTEM
-- RLS, Storage & Fallback Script for Catalog & Direct Image Uploads
-- File: packages/supabase/scripts/fix_inventory_rls.sql
-- =============================================================================

-- 1. Ensure public read/write policies on products and categories
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select products" ON public.products;
CREATE POLICY "Public select products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update products" ON public.products;
CREATE POLICY "Allow update products" ON public.products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow insert products" ON public.products;
CREATE POLICY "Allow insert products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public select categories" ON public.categories;
CREATE POLICY "Public select categories" ON public.categories FOR SELECT USING (true);

-- 2. Configure public storage bucket for direct product image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow upload product-images" ON storage.objects;
CREATE POLICY "Allow upload product-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow update product-images" ON storage.objects;
CREATE POLICY "Allow update product-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

-- 3. Ensure store_id fallback on all products
UPDATE public.products 
SET store_id = 'a0000000-0000-0000-0000-000000000001' 
WHERE store_id IS NULL;
