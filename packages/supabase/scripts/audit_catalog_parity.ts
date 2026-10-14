import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wwxuiexvgsmweuzddsea.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0hBS2oJoMd_DLcuu6o61jw_D7jTbZ4a';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runParityAudit() {
  console.log('🔍 [AUDIT] Starting Catalog & Systems Verification...\n');

  // 1. Total Catalog Count
  const { data: allProducts, error: prodErr } = await supabase
    .from('products')
    .select('id, name, price, discount_price, is_available, category_id, image_url, store_id');

  if (prodErr) {
    console.error('❌ Failed to fetch products:', prodErr.message);
    process.exit(1);
  }

  console.log(`✅ Total Products in Supabase: ${allProducts.length}`);

  // 2. Category Distribution
  const { data: categories } = await supabase.from('categories').select('id, name, slug');
  console.log(`✅ Total Active Categories: ${categories?.length || 0}`);

  const categoryMap = new Map(categories?.map(c => [c.id, c.name]));
  const countsByCategory: Record<string, number> = {};

  allProducts.forEach(p => {
    const catName = categoryMap.get(p.category_id) || 'Uncategorized';
    countsByCategory[catName] = (countsByCategory[catName] || 0) + 1;
  });

  console.log('\n📊 Product Distribution Across Categories:');
  console.table(countsByCategory);

  // 3. Operator Inventory Query Simulation
  // Ensure the exact query executed by apps/admin/app/operator/inventory/page.tsx returns all items
  const { data: operatorView, error: opErr } = await supabase
    .from('products')
    .select('id, name, price, is_available, image_url')
    .order('name');

  if (opErr || !operatorView) {
    console.error('❌ Operator Panel query simulation failed:', opErr?.message);
    process.exit(1);
  }

  console.log(`✅ Operator Inventory View Count: ${operatorView.length} items`);
  if (operatorView.length !== allProducts.length) {
    console.warn(`⚠️ Warning: Mismatch between raw products (${allProducts.length}) and operator view (${operatorView.length})!`);
  } else {
    console.log('🎯 100% Catalog Parity Confirmed: Every product appears on the Operator Panel.');
  }

  // 4. Missing Image / Fallback Check
  const missingImages = allProducts.filter(p => !p.image_url || p.image_url.trim() === '');
  console.log(`ℹ️ Products with missing image: ${missingImages.length} (Operator can upload directly via <ImageUploader/>)`);

  // 5. Storage Bucket Check
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  const hasProductBucket = buckets?.some(b => b.name === 'product-images');
  console.log(hasProductBucket ? '✅ Storage bucket "product-images" is ready.' : '❌ Storage bucket "product-images" is MISSING!');

  console.log('\n✨ Audit Complete.');
}

runParityAudit();
