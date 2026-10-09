-- =============================================================================
-- BELZO HYPERLOCAL QUICK-COMMERCE ECOSYSTEM
-- Master Database Seed: Client-Verified Multi-Vertical Catalog
-- File: packages/supabase/scripts/seed_full_client_catalog.sql
-- Hub: Joniha Central Dark Store ('a0000000-0000-0000-0000-000000000001')
-- =============================================================================

-- 0. Ensure Joniha Central Hub Dark Store Exists
INSERT INTO public.dark_stores (id, name, hub_code, address, latitude, longitude, service_radius_km, contact_phone, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Joniha Central Dark Store',
    'HUB-UP-JON-01',
    'Main Market Road, Joniha, Bindki, Fatehpur, UP 212664',
    26.0350000,
    80.4650000,
    5.00,
    '+919876543210',
    TRUE
)
ON CONFLICT (hub_code) DO NOTHING;

-- 1. Setup All Commercial Categories
INSERT INTO public.categories (id, name, slug, icon, sort_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'Taza Sabzi Mandi', 'produce', 'carrot', 1),
('c0000000-0000-0000-0000-000000000002', 'Kirana, Oils & Staples', 'staples', 'package', 2),
('c0000000-0000-0000-0000-000000000003', 'Masale & Spices', 'spices', 'flame', 3),
('c0000000-0000-0000-0000-000000000004', 'Cold Drinks & Beverages', 'drinks', 'cup-soda', 4),
('c0000000-0000-0000-0000-000000000005', 'Mithai & Chocolates', 'sweets', 'candy', 5),
('c0000000-0000-0000-0000-000000000006', 'Pizza, Momos & Bakery', 'fastfood', 'pizza', 6),
('c0000000-0000-0000-0000-000000000007', 'Desi Dhaba Kitchen & Meals', 'meals', 'utensils', 7),
('c0000000-0000-0000-0000-000000000008', 'Dry Fruits, Biscuits & Munchies', 'munchies', 'cookie', 8)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 2. Clear previous placeholder items for Joniha Hub
DELETE FROM public.products WHERE store_id = 'a0000000-0000-0000-0000-000000000001';

-- 3. Insert Client Verified Catalog
INSERT INTO public.products (store_id, category_id, name, description, unit, price, discount_price, stock_quantity, is_available, image_url) VALUES

-- ==================== 1. TAZA SABZI MANDI ====================
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Deva Pahadi Aloo (देसी आलू)', 'Fresh mountain potatoes, superior taste.', '1 kg', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Anand Aloo (Local)', 'Freshly harvested daily cooking potatoes.', '1 kg', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Desi Lal Pyaj (Onion)', 'Crisp red onions from local mandi.', '1 kg', 60.00, 58.00, 150, TRUE, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Desi Tamatar (Tomato)', 'Ripe, firm, juicy red desi tomatoes.', '1 kg', 200.00, 190.00, 80, TRUE, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Taza Kheera (Cucumber)', 'Crisp salad cucumbers, harvested daily.', '1 kg', 40.00, 38.00, 50, TRUE, 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Desi Parwal', 'Fresh green parwal for authentic curries.', '1 kg', 100.00, 95.00, 40, TRUE, 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Meetha Kaddu (Pumpkin)', 'Tender yellow pumpkin slices.', '1 kg', 40.00, 38.00, 40, TRUE, 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Gol Baingan (Brinjal)', 'Shiny purple round brinjals for bharta.', '1 kg', 60.00, 58.00, 50, TRUE, 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Nemi Baingan', 'Slender tender brinjal.', '1 kg', 40.00, 38.00, 50, TRUE, 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Tori (Ridge Gourd)', 'Farm-fresh ridge gourd.', '1 kg', 60.00, 58.00, 40, TRUE, 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Green Shimla Mirch (Capsicum)', 'Crisp bell peppers for stir fries.', '1 kg', 80.00, 75.00, 40, TRUE, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Teekhi Hari Mirch', 'Spicy green chillies.', '1 kg', 60.00, 58.00, 60, TRUE, 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Desi Adrak (Ginger)', 'Juicy aromatic ginger.', '1 kg', 120.00, 115.00, 50, TRUE, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Taza Lauki (Bottle Gourd)', 'Juicy straight bottle gourd.', '1 pc', 30.00, 28.00, 30, TRUE, 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Chaulai Saag', 'Fresh green leafy chaulai.', '1 bunch', 10.00, 10.00, 40, TRUE, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Komal Bhindi (Lady Finger)', 'Tender green okra.', '1 kg', 40.00, 38.00, 50, TRUE, 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Desi Karela (Bitter Gourd)', 'Fresh bitter gourd.', '500 g', 60.00, 58.00, 40, TRUE, 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Phoolgobhi (Cauliflower)', 'Clean white cauliflower.', '1 pc', 40.00, 38.00, 30, TRUE, 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Hara Dhaniya (Coriander)', 'Fragrant coriander bunch.', '250 g', 40.00, 38.00, 50, TRUE, 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Fresh Button Mushroom', 'Packaged button mushrooms.', '200 g', 70.00, 65.00, 30, TRUE, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80'),

-- ==================== 2. KIRANA, OILS & STAPLES ====================
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Sarso Tel (Mustard Oil)', 'Kachi ghani pure mustard oil.', '1 Litre', 200.00, 195.00, 60, TRUE, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Fortune Refined Oil', 'Refined edible cooking oil.', '1 Litre', 160.00, 155.00, 50, TRUE, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Nutrela Soybean Oil', 'Pure refined soyabean oil.', '1 Litre', 120.00, 115.00, 50, TRUE, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Maida (Fine Flour)', 'Double-sifted wheat maida.', '1 kg', 40.00, 38.00, 60, TRUE, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Sooji / Rawa', 'Pure granulated wheat semolina.', '1 kg', 50.00, 48.00, 50, TRUE, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Chana Besan', 'Pure ground gram flour.', '1 kg', 100.00, 95.00, 60, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Basmati Chawal (Rice)', 'Long grain aromatic rice.', '1 kg', 90.00, 85.00, 60, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Arhar Daal (Toor)', 'Unpolished rich protein toor dal.', '1 kg', 100.00, 95.00, 50, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Bhuna Chana', 'Roasted healthy snack gram.', '1 kg', 110.00, 105.00, 40, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Thick Poha', 'Clean rice flakes.', '1 kg', 120.00, 110.00, 50, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Shuddh Cheeni (Sugar)', 'Crystal white sugar.', '1 kg', 50.00, 48.00, 80, TRUE, 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Tata Namak (Salt)', 'Desh ka namak, vacuum evaporated.', '1 kg', 30.00, 28.00, 100, TRUE, 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Tata Agni Chai', 'Extra strong black tea.', '250 g', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Taaza Tea', 'Refreshing fresh leaf tea.', '250 g', 25.00, 25.00, 60, TRUE, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Italian Pasta', 'Durum wheat pasta.', '1 kg', 60.00, 58.00, 40, TRUE, 'https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Chowmein Noodles', 'Quick cook street noodles.', '500 g', 30.00, 28.00, 50, TRUE, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Roasted Sewai', 'Thin vermicelli for kheer.', '100 g', 10.00, 10.00, 80, TRUE, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'White Vinegar (Sirka)', 'Cooking vinegar.', '500 g', 40.00, 38.00, 40, TRUE, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Navranga Desi Achar', 'Spicy mixed mango pickle.', '1 kg', 120.00, 115.00, 30, TRUE, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80'),

-- ==================== 3. MASALE & SPICES ====================
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Goldi Haldi Powder', 'Pure turmeric powder.', '200 g', 65.00, 60.00, 60, TRUE, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Goldi Lal Mirch Powder', 'Hot spicy red chilli.', '200 g', 75.00, 70.00, 60, TRUE, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Goldi Dhaniya Powder', 'Aromatic coriander powder.', '200 g', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Sabut Jeera (Cumin)', 'Whole cumin seeds.', '200 g', 80.00, 75.00, 50, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Goldi Garam Masala', 'Blend of aromatic spices.', '100 g', 110.00, 105.00, 50, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Goldi Chaat Masala', 'Tangy chatpata seasoning.', '200 g', 70.00, 68.00, 40, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Goldi Kitchen King Masala', 'Curry special masala.', '100 g', 70.00, 68.00, 50, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Goldi Sabji Masala', 'Daily vegetable seasoning.', '100 g', 70.00, 68.00, 50, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Sicca Hing (Asafoetida)', 'Pungent aromatic hing.', '70 g', 39.00, 39.00, 50, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Kali Mirch (Black Pepper)', 'Whole black peppercorns.', '50 g', 50.00, 48.00, 40, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Sabut Laung (Clove)', 'Whole cloves.', '50 g', 50.00, 48.00, 40, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Dalchini (Cinnamon)', 'Aromatic cinnamon sticks.', '50 g', 25.00, 25.00, 40, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Chhoti Elaichi (Cardamom)', 'Fragrant green cardamom.', '25 g', 90.00, 85.00, 30, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Kasuri Methi', 'Dried fenugreek leaves.', '50 g', 50.00, 48.00, 40, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'),

-- ==================== 4. COLD DRINKS & BEVERAGES ====================
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Sting Energy Drink', 'Electrifying red energy drink.', '250 ml', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002'::uuid, 'Basmati Chawal (Rice)', 'Long grain aromatic rice.', '1 kg', 90.00, 85.00, 60, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80')
-- Note: Replaced above duplicate row with Sprite Lime Fizz:
,
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Sprite Lime Fizz', 'Clear lemon lime soft drink.', '750 ml', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Thums Up Charged', 'Strong spicy cola.', '750 ml', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Coca Cola Classic', 'Chilled original formula cola.', '750 ml', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Campa Cola 2L', 'Desi fizz 2 Litre mega party bottle.', '2 Litre', 90.00, 85.00, 40, TRUE, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Mountain Dew 2.25L', 'Citrus punch mega pack.', '2.25 Litre', 100.00, 95.00, 30, TRUE, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Maaza Mango Pulp', 'Rich thick Alphonso mango drink.', '2 Litre', 100.00, 95.00, 30, TRUE, 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Red Bull Energy Can', 'Premium vitalizing energy drink.', '250 ml', 130.00, 125.00, 40, TRUE, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Hell Energy Can', 'Classic European energy drink.', '250 ml', 60.00, 60.00, 50, TRUE, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80'),

-- ==================== 5. MITHAI & CHOCOLATES ====================
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Desi Ghee Gulab Jamun', 'Soft juicy melt-in-mouth mawa gulab jamun.', '500 g', 150.00, 140.00, 40, TRUE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Spongy Chena Rasgulla', 'Light, soft and syrupy white rasgullas.', '500 g', 140.00, 130.00, 40, TRUE, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Kesar Rajbhog', 'Large saffron-infused stuffed rasgulla.', '500 g', 180.00, 170.00, 30, TRUE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Shuddh Besan Ke Laddu', 'Aromatic roasted gram flour laddus.', '500 g', 160.00, 150.00, 40, TRUE, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Cadbury Dairy Milk Crackle', 'Rich milk chocolate with crunchy crispy pearls.', '1 pc', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Nestle KitKat Wafer Bar', 'Crisp chocolate wafer finger bar.', '1 pc', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Cadbury 5 Star Chocolate', 'Caramel and nougat filled chocolate bar.', '1 pc', 10.00, 10.00, 100, TRUE, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80'),

-- ==================== 6. PIZZA, MOMOS & BAKERY ====================
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Special Kulhad Pizza', 'Pizza Paradise wood-fired cheesy kulhad delight.', '1 kulhad', 79.00, 79.00, 40, TRUE, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Cheese Overloaded Pizza (Single Cheese)', 'Mozzarella overload on crispy crust.', 'Regular', 70.00, 70.00, 30, TRUE, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Paneer Tikka Pizza (Medium)', 'Tandoori paneer, capsicum, onion & double cheese.', 'Medium', 260.00, 249.00, 20, TRUE, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Red Sauce Pasta', 'Tangy spicy tomato herb penne.', '1 bowl', 120.00, 110.00, 25, TRUE, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'White Sauce Cheesy Pasta', 'Creamy alfredo pasta loaded with sweet corn.', '1 bowl', 120.00, 110.00, 25, TRUE, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Four Pizza Value Combo + Cold Drink', '4 Regular Pizzas + 1 Garlic Bread + 500ml Drink.', 'Combo Pack', 249.00, 249.00, 20, TRUE, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Paneer Fried Momos (6 Pcs)', 'Crispy fried momos stuffed with spiced paneer.', '6 pcs', 89.00, 85.00, 30, TRUE, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Fresh Birthday Cake (Black Forest)', 'Bala Ji Bakery fresh cream birthday cake.', '500 g', 170.00, 160.00, 15, TRUE, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Hot Choco Lava Cake', 'Gooey melted chocolate core cake.', '1 pc', 70.00, 65.00, 25, TRUE, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=400&q=80'),

-- ==================== 7. DESI DHABA KITCHEN & MEALS ====================
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 'Special Dhaba Thali', 'Paneer, Dal Makhani, Seasonal Sabji, Roti, Rice & Sweet.', '1 Thali', 200.00, 190.00, 30, TRUE, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 'Saada Thali', 'Dal Tadka, Mix Veg, 4 Tawa Roti, Rice & Salad.', '1 Thali', 150.00, 140.00, 40, TRUE, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 'Kadhai Paneer (Full)', 'Spicy dhaba style kadhai paneer with bell peppers.', 'Full', 250.00, 239.00, 20, TRUE, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 'Dal Tadka (Butter Dhaba Style)', 'Yellow dal with garlic, cumin and desi ghee tadka.', 'Full', 140.00, 130.00, 30, TRUE, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 'Tandoor Butter Roti (Pack of 4)', 'Hot clay-oven baked whole wheat rotis with butter.', '4 pcs', 60.00, 55.00, 50, TRUE, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 'Desi Aloo Paratha (2 Pcs)', 'Stuffed spiced potato parathas with butter & pickle.', '2 pcs', 80.00, 80.00, 30, TRUE, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 'Jeera Fried Rice (Full)', 'Fragrant basmati rice tossed with roasted cumin.', 'Full', 100.00, 95.00, 30, TRUE, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80'),

-- ==================== 8. DRY FRUITS, BISCUITS & MUNCHIES ====================
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'California Badam (Almonds)', 'Whole crunchy almonds.', '250 g', 250.00, 240.00, 40, TRUE, 'https://images.unsplash.com/photo-1508061252966-f7ac08f96d63?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'Kaju Tukda / Whole (Cashews)', 'Rich buttery cashews.', '250 g', 250.00, 240.00, 40, TRUE, 'https://images.unsplash.com/photo-1536591375315-1b8368903277?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'Phool Makhana (Fox Nuts)', 'Crispy light healthy lotus seeds.', '250 g', 280.00, 270.00, 40, TRUE, 'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'Parle-G Family Pack', 'Original glucose biscuits.', 'Family Pack', 60.00, 58.00, 60, TRUE, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'Dark Fantasy Choco Fills', 'Rich chocolate cookies.', '100 g', 35.00, 35.00, 50, TRUE, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'Bikaner Bhujia Namkeen', 'Crisp spicy gram bhujia.', '200 g', 85.00, 80.00, 50, TRUE, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'Maggi 2-Minute Masala Noodles', 'Classic instant noodles.', '70 g', 15.00, 14.00, 120, TRUE, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80');
