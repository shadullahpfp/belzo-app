-- Create public bucket for product images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies allowing public read and authenticated/anon uploads
DROP POLICY IF EXISTS "Public Access product-images" ON storage.objects;
CREATE POLICY "Public Access product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Upload product-images" ON storage.objects;
CREATE POLICY "Allow Upload product-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Update product-images" ON storage.objects;
CREATE POLICY "Allow Update product-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');
