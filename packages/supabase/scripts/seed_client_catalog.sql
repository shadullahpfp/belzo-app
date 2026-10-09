-- =========================================================================
-- BELZO HYPERLOCAL QUICK-COMMERCE ECOSYSTEM
-- Master Database Seed: Strict 6-Category Hierarchy & Visual Accuracy
-- File: packages/supabase/scripts/seed_client_catalog.sql
-- Store: Joniha Central Hub ('a0000000-0000-0000-0000-000000000001')
-- =========================================================================

-- 0. Ensure Joniha Dark Store Exists
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

-- 1. Ensure the 6 Official Belzo Main Categories
INSERT INTO public.categories (id, name, slug, icon, sort_order) VALUES
('cat-01-grocery', 'Grocery', 'grocery', 'shopping-cart', 1),
('cat-02-produce', 'Fruits & Vegetables', 'produce', 'salad', 2),
('cat-03-food', 'Food & Restaurant', 'food', 'pizza', 3),
('cat-04-pharma', 'Medicine & Healthcare', 'pharma', 'pill', 4),
('cat-05-fashion', 'Fashion', 'fashion', 'shirt', 5),
('cat-06-electronics', 'Electronics', 'electronics', 'smartphone', 6)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- 2. Clear old test products for Joniha Hub
DELETE FROM public.products WHERE store_id = 'a0000000-0000-0000-0000-000000000001';

-- 3. Insert All Products Correctly Mapped into the 6 Categories
INSERT INTO public.products (store_id, category_id, name, description, unit, price, discount_price, stock_quantity, is_available, image_url) VALUES

-- =========================================================================
-- CATEGORY 1: FRUITS & VEGETABLES (cat-02-produce)
-- =========================================================================
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Deva Pahadi Aloo (देसी आलू)', 'Fresh mountain potatoes, superior texture for frying & curries.', '1 kg', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Anand Aloo (Local Mandi)', 'Freshly dug local potatoes for daily meals.', '1 kg', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Lal Pyaj (Onion)', 'Crisp dry skin red onions from local farms.', '1 kg', 60.00, 58.00, 120, TRUE, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Lal Tamatar (Tomato)', 'Naturally ripened, firm red juicy tomatoes.', '1 kg', 200.00, 190.00, 80, TRUE, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Taza Desi Kheera (Cucumber)', 'Crispy, cool fresh cucumbers for salads.', '1 kg', 40.00, 38.00, 50, TRUE, 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Parwal (Pointed Gourd)', 'Farm-fresh tender pointed gourd for curries.', '1 kg', 100.00, 95.00, 40, TRUE, 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Meetha Kaddu (Pumpkin)', 'Tender sweet yellow pumpkin slices.', '1 kg', 40.00, 38.00, 40, TRUE, 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Gol Baingan (Purple Brinjal)', 'Glossy round purple eggplants for bharta.', '1 kg', 60.00, 58.00, 50, TRUE, 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Nemi Baingan (Slender Brinjal)', 'Tender seedless slender brinjals.', '1 kg', 40.00, 38.00, 40, TRUE, 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Tori (Ridge Gourd)', 'Tender green ridged gourd, freshly picked.', '1 kg', 60.00, 58.00, 40, TRUE, 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Green Shimla Mirch (Capsicum)', 'Crunchy green bell peppers for chowmein & curries.', '1 kg', 80.00, 75.00, 40, TRUE, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Teekhi Hari Mirch (Green Chillies)', 'Spicy sharp green chillies for daily tadka.', '1 kg', 60.00, 58.00, 50, TRUE, 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Adrak (Fresh Ginger)', 'Aromatic, spicy raw ginger roots.', '1 kg', 120.00, 115.00, 50, TRUE, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Taza Lauki (Bottle Gourd)', 'Straight tender light green bottle gourd.', '1 pc', 30.00, 28.00, 30, TRUE, 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Chaulai Saag', 'Fresh tender leafy green chaulai saag.', '1 bunch', 10.00, 10.00, 40, TRUE, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Komal Bhindi (Lady Finger)', 'Tender non-fibrous green okra.', '1 kg', 40.00, 38.00, 50, TRUE, 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Karela (Bitter Gourd)', 'Farm-fresh rough-skinned bitter gourd.', '500 g', 60.00, 58.00, 30, TRUE, 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Phoolgobhi (Cauliflower)', 'Clean, compact white cauliflower head.', '1 pc', 40.00, 38.00, 30, TRUE, 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Taza Hara Dhaniya (Coriander)', 'Fresh aromatic coriander leaves with roots.', '250 g', 40.00, 38.00, 50, TRUE, 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Button Mushroom Pack', 'Sealed organic fresh white mushrooms.', '200 g', 70.00, 65.00, 25, TRUE, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Lehsun (Garlic)', 'Aromatic white garlic cloves.', '4 pcs', 20.00, 20.00, 60, TRUE, 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=500&q=80'),

-- =========================================================================
-- CATEGORY 2: GROCERY & DAILY STAPLES (cat-01-grocery)
-- =========================================================================
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sarso Tel (Pure Mustard Oil)', 'Kachi ghani pure mustard oil in transparent bottle.', '1 Litre', 200.00, 195.00, 60, TRUE, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Fortune Refined Oil', 'Refined edible cooking oil pouch.', '1 Litre', 160.00, 155.00, 50, TRUE, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Nutrela Soybean Oil', 'Pure refined soybean cooking oil.', '1 Litre', 120.00, 115.00, 50, TRUE, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Chakki Fresh Maida', 'Double-refined wheat flour powder.', '1 kg', 40.00, 38.00, 60, TRUE, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Shuddh Sooji / Rawa', 'Pure granulated wheat semolina in bowl.', '1 kg', 50.00, 48.00, 50, TRUE, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Chana Besan (Gram Flour)', 'Pure ground gram besan powder.', '1 kg', 100.00, 95.00, 60, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Basmati Chawal (Special)', 'Long grain polished white basmati rice.', '1 kg', 90.00, 85.00, 60, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Desi Arhar Daal (Toor)', 'Rich protein unpolished yellow toor dal.', '1 kg', 100.00, 95.00, 50, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Bhuna Chana (Roasted)', 'Healthy crispy roasted gram with skin.', '1 kg', 110.00, 105.00, 40, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Thick Poha (Flattened Rice)', 'Clean beaten white rice flakes.', '1 kg', 120.00, 110.00, 50, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Shuddh Cheeni (Sugar)', 'Sparkling white crystalline sugar.', '1 kg', 50.00, 48.00, 80, TRUE, 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Tata Namak (Vacuum Salt)', 'Iodized pure salt pack.', '1 kg', 30.00, 28.00, 100, TRUE, 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Tata Agni Kadak Chai', 'Dhanedar extra strong black tea.', '250 g', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Taaza Fresh Tea', 'Light refreshing daily tea leaf.', '250 g', 25.00, 25.00, 60, TRUE, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Italian Penne Pasta', 'Durum wheat pasta.', '1 kg', 60.00, 58.00, 40, TRUE, 'https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Chowmein Noodles Pack', 'Quick boiling street noodles.', '500 g', 30.00, 28.00, 50, TRUE, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Roasted Wheat Sewai', 'Thin golden roasted vermicelli.', '100 g', 10.00, 10.00, 80, TRUE, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'White Vinegar (Sirka)', 'Clear brewed cooking vinegar in bottle.', '500 g', 40.00, 38.00, 40, TRUE, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Navranga Desi Achar', 'Spiced traditional mango pickle in glass jar.', '1 kg', 120.00, 115.00, 30, TRUE, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Goldi Haldi Powder', 'Pure bright yellow turmeric powder in bowl.', '200 g', 65.00, 60.00, 60, TRUE, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Goldi Lal Mirch Powder', 'Vibrant spicy red chilli powder in bowl.', '200 g', 75.00, 70.00, 60, TRUE, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Goldi Dhaniya Powder', 'Ground green aromatic coriander powder.', '200 g', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sabut Jeera (Cumin)', 'Whole aromatic cumin seeds.', '200 g', 80.00, 75.00, 50, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Goldi Garam Masala', 'Blend of authentic roasted ground spices.', '100 g', 110.00, 105.00, 50, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sicca Hing (Asafoetida)', 'Pure tadka hing.', '70 g', 39.00, 39.00, 50, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sting Energy Drink Pet Bottle', 'Vibrant red caffeinated energy drink.', '250 ml', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Thums Up Charged Cola', 'Strong spicy Indian fizz bottle.', '750 ml', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sprite Lemon Lime Fizz', 'Clear green crisp soda bottle.', '750 ml', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Mountain Dew 2.25L', 'High energy citrus fizz mega bottle.', '2.25 Litre', 100.00, 95.00, 30, TRUE, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Maaza Mango Fruit Drink', 'Rich thick Alphonso mango juice bottle.', '2 Litre', 100.00, 95.00, 30, TRUE, 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Red Bull Energy Can', 'Silver & blue slim energy can.', '250 ml', 130.00, 125.00, 40, TRUE, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Desi Ghee Gulab Jamun', 'Warm soft dark-brown mawa gulab jamun in sweet syrup.', '500 g', 150.00, 140.00, 40, TRUE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Spongy Chena Rasgulla', 'Pure white juicy cottage cheese rasgulla in sugar syrup.', '500 g', 140.00, 130.00, 40, TRUE, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Shuddh Besan Ke Laddu', 'Aromatic roasted gram flour spherical sweets.', '500 g', 160.00, 150.00, 40, TRUE, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Cadbury Dairy Milk Crackle', 'Original Cadbury chocolate bar in purple wrapper.', '1 pc', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Nestle KitKat Wafer Bar', 'Classic red pack crispy wafer 4-finger chocolate.', '1 pc', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Cadbury 5 Star Chocolate', 'Golden wrapped caramel chocolate bar.', '1 pc', 10.00, 10.00, 100, TRUE, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Parle-G Family Pack', 'Original iconic glucose biscuits.', 'Family Pack', 60.00, 58.00, 60, TRUE, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sunfeast Dark Fantasy Choco Fills', 'Crunchy chocolate cookie with molten fudge centre.', '100 g', 35.00, 35.00, 50, TRUE, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Maggi 2-Minute Masala Noodles', 'Classic 2-minute instant noodles pack.', '70 g', 15.00, 14.00, 120, TRUE, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'California Badam (Almonds)', 'Crunchy premium whole dry almonds in bowl.', '250 g', 250.00, 240.00, 40, TRUE, 'https://images.unsplash.com/photo-1508061252966-f7ac08f96d63?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'W320 White Kaju (Cashews)', 'Rich buttery whole white cashew nuts.', '250 g', 250.00, 240.00, 40, TRUE, 'https://images.unsplash.com/photo-1536591375315-1b8368903277?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Phool Makhana (Fox Nuts)', 'Crisp roasted healthy lotus seeds.', '250 g', 280.00, 270.00, 40, TRUE, 'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?auto=format&fit=crop&w=500&q=80'),

-- =========================================================================
-- CATEGORY 3: FOOD & RESTAURANT (cat-03-food)
-- =========================================================================
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Special Kulhad Pizza (Pizza Paradise)', 'Authentic clay kulhad packed with melted cheese, corn & capsicum.', '1 kulhad', 79.00, 79.00, 40, TRUE, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Cheese Overloaded Pizza (Pizza Paradise)', 'Crispy thin crust bursting with melted mozzarella cheese.', 'Regular', 70.00, 70.00, 30, TRUE, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Paneer Tikka Pizza (Pizza Paradise)', 'Topped with spiced tandoori paneer, onions & bell peppers.', 'Medium', 260.00, 249.00, 20, TRUE, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Stuffed Garlic Bread with Dip (Pizza Paradise)', 'Freshly baked herbs bread loaded with mozzarella & jalapenos.', '1 pack', 119.00, 110.00, 25, TRUE, 'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Hot Choco Lava Cake (Pizza Paradise)', 'Warm mini dark chocolate cake with molten fudge centre.', '1 pc', 70.00, 65.00, 30, TRUE, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Aloo Tikki Burger (Pizza Paradise)', 'Toasted sesame bun with crunchy spiced potato patty.', '1 pc', 49.00, 49.00, 40, TRUE, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Four Pizza Value Combo (Pizza Paradise)', '4 Regular Pizzas + 1 Garlic Bread + 500ml Cold Drink.', 'Combo Pack', 249.00, 249.00, 20, TRUE, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Steamed Veg Momos (Bala Ji Restaurant)', 'Delicate steamed dumplings with fiery red chilli schezwan sauce.', '6 pcs', 39.00, 39.00, 35, TRUE, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Paneer Fried Momos (Bala Ji Restaurant)', 'Golden crispy fried momos stuffed with seasoned paneer.', '6 pcs', 89.00, 85.00, 30, TRUE, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Hot Paneer Frankie Roll (Bala Ji Restaurant)', 'Buttery flaky roll wrapped around juicy spicy cottage cheese.', '1 pc', 40.00, 40.00, 30, TRUE, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Desi Veg Chowmein (Bala Ji Restaurant)', 'Street-style spicy wok noodles tossed with fresh veggies.', 'Half Plate', 40.00, 40.00, 30, TRUE, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Kurkuri Aloo Tikki Chaat (Bala Ji Restaurant)', 'Crushed golden tikkis topped with sweet curd, saunth & sev.', '1 plate', 20.00, 20.00, 30, TRUE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Fresh Birthday Cake (Black Forest - Bala Ji Bakery)', 'Layers of chocolate sponge, fresh vanilla cream & cherries.', '500 g', 170.00, 160.00, 15, TRUE, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Special Dhaba Thali (Desi Dhaba)', 'Vegetarian brass thali: Shahi Paneer, Dal Makhani, 4 Roti, Rice & Sweet.', '1 Thali', 200.00, 190.00, 30, TRUE, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Saada Thali (Desi Dhaba)', 'Yellow Dal Tadka, Seasonal Sabji, 4 Tawa Roti, Rice & Salad.', '1 Thali', 150.00, 140.00, 40, TRUE, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Dhaba Kadhai Paneer (Desi Dhaba)', 'Paneer simmered with fresh ground spices, capsicum & tomatoes.', 'Full', 250.00, 239.00, 20, TRUE, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Dal Tadka Butter (Desi Dhaba)', 'Yellow toor dal tempered with desi ghee, garlic & cumin.', 'Full', 140.00, 130.00, 30, TRUE, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Tandoori Butter Roti (Desi Dhaba)', 'Hot whole wheat clay-oven baked rotis brushed with butter.', 'Pack of 4', 60.00, 55.00, 50, TRUE, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Desi Aloo Paratha (Desi Dhaba)', 'Tawa roasted golden wheat paratha stuffed with spiced potatoes.', '2 pcs', 80.00, 80.00, 30, TRUE, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Jeera Fried Rice (Desi Dhaba)', 'Steamed aromatic basmati rice tempered with roasted cumin seeds.', 'Full Plate', 100.00, 95.00, 30, TRUE, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80'),

-- =========================================================================
-- CATEGORY 4: MEDICINE & HEALTHCARE (cat-04-pharma)
-- =========================================================================
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Electral ORS Energy Sachet', 'Instant hydration rehydration electrolyte drink.', '1 sachet', 22.00, 20.00, 80, TRUE, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Dettol Antiseptic Liquid', 'First aid disinfectant liquid.', '100 ml', 45.00, 42.00, 50, TRUE, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80'),

-- =========================================================================
-- CATEGORY 5: FASHION (cat-05-fashion)
-- =========================================================================
('a0000000-0000-0000-0000-000000000001', 'cat-05-fashion', 'Pure Cotton Ankle Socks', 'Breathable stretch cotton socks.', 'Pack of 3', 149.00, 129.00, 30, TRUE, 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=500&q=80'),

-- =========================================================================
-- CATEGORY 6: ELECTRONICS (cat-06-electronics)
-- =========================================================================
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'Type-C Fast Braided Cable', '100W Power delivery durable nylon braided cable.', '1.2 m', 249.00, 199.00, 40, TRUE, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'Duracell Ultra Alkaline AA Batteries', 'Long lasting power cells for household electronics.', 'Pack of 4', 195.00, 190.00, 60, TRUE, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80');
