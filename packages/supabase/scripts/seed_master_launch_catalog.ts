import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../apps/mobile/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../apps/admin/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://wwxuiexvgsmweuzddsea.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_0hBS2oJoMd_DLcuu6o61jw_D7jTbZ4a';

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORIES = [
  { id: 'cat-01-grocery', name: 'Grocery', slug: 'grocery', icon: 'shopping-cart', sort_order: 1 },
  { id: 'cat-02-produce', name: 'Fruits & Vegetables', slug: 'produce', icon: 'salad', sort_order: 2 },
  { id: 'cat-03-food', name: 'Food & Restaurant', slug: 'food', icon: 'pizza', sort_order: 3 },
  { id: 'cat-04-pharma', name: 'Medicine & Healthcare', slug: 'pharma', icon: 'pill', sort_order: 4 },
  { id: 'cat-05-fashion', name: 'Fashion', slug: 'fashion', icon: 'shirt', sort_order: 5 },
  { id: 'cat-06-electronics', name: 'Electronics', slug: 'electronics', icon: 'smartphone', sort_order: 6 },
];

async function seedMasterCatalog() {
  console.log('🚀 [Master Catalog Seeder] Connecting to Supabase at:', supabaseUrl);

  // 1. Ensure Dark Store exists
  try {
    const { error: storeErr } = await supabase.from('dark_stores').upsert({
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Joniha Central Dark Store',
      hub_code: 'HUB-UP-JON-01',
      address: 'Main Market Road, Joniha, Bindki, Fatehpur, UP 212664',
      latitude: 26.035,
      longitude: 80.465,
      service_radius_km: 5.0,
      contact_phone: '+919876543210',
      is_active: true,
    }, { onConflict: 'id' });
    if (storeErr) console.warn('Store upsert note:', storeErr.message);
    else console.log('✅ Joniha Central Dark Store confirmed.');
  } catch (e) {
    console.warn('Store check error:', e);
  }

  // 2. Upsert Strict 6 Categories
  for (const cat of CATEGORIES) {
    try {
      const { error: catErr } = await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
      if (catErr) console.warn(`Category ${cat.slug} upsert note:`, catErr.message);
    } catch {}
  }
  console.log('✅ 6 Strict Official Categories seeded.');

  // Load verified items
  const { items } = require('/Users/apple/.gemini/antigravity-ide/brain/2bcd3b2b-b1f2-41d8-a1eb-9af234a19718/scratch/verify_catalog.js');
  console.log(`📦 Loaded ${items.length} verified zero-duplicate client products.`);

  // 3. Delete existing products for Joniha hub
  try {
    const { error: delErr } = await supabase
      .from('products')
      .delete()
      .eq('store_id', 'a0000000-0000-0000-0000-000000000001');
    if (delErr) console.warn('Delete old products note:', delErr.message);
  } catch (e) {
    console.warn('Delete note:', e);
  }

  // 4. Batch insert products (batches of 25)
  const batchSize = 25;
  let inserted = 0;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize).map((p: any) => ({
      store_id: p.store_id,
      category_id: p.category_id,
      name: p.name,
      description: p.description,
      unit: p.unit,
      price: p.price,
      discount_price: p.discount_price,
      stock_quantity: p.stock_quantity,
      is_available: p.is_available,
      image_url: p.image_url,
    }));

    const { error: insErr } = await supabase.from('products').insert(batch);
    if (insErr) {
      console.warn(`Batch ${i}-${i + batch.length} note:`, insErr.message);
    } else {
      inserted += batch.length;
      console.log(`✔ Inserted batch ${inserted}/${items.length}`);
    }
  }

  console.log(`🎉 Master Catalog Seed complete! Inserted ${inserted}/${items.length} products.`);
}

seedMasterCatalog().catch(console.error);
