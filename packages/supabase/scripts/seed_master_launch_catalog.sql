-- =============================================================================
-- BELZO HYPERLOCAL QUICK-COMMERCE ECOSYSTEM
-- Definitive Production Master Catalog Seed (Strict 6 Categories, 124 Verified Client Items)
-- Hub: Joniha Central Dark Store ('a0000000-0000-0000-0000-000000000001')
-- =============================================================================

-- 0. Ensure Joniha Central Dark Store Exists
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

-- 1. Setup Strict 6 Official Belzo Categories
INSERT INTO public.categories (id, name, slug, icon, sort_order) VALUES
('cat-01-grocery', 'Grocery', 'grocery', 'shopping-cart', 1),
('cat-02-produce', 'Fruits & Vegetables', 'produce', 'salad', 2),
('cat-03-food', 'Food & Restaurant', 'food', 'pizza', 3),
('cat-04-pharma', 'Medicine & Healthcare', 'pharma', 'pill', 4),
('cat-05-fashion', 'Fashion', 'fashion', 'shirt', 5),
('cat-06-electronics', 'Electronics', 'electronics', 'smartphone', 6)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- 2. Clear previous placeholder items for Joniha Hub
DELETE FROM public.products WHERE store_id = 'a0000000-0000-0000-0000-000000000001';

-- 3. Complete Client Inventory Insert (100% Unique Verified Product Images, Zero Duplicates)
INSERT INTO public.products (store_id, category_id, name, description, unit, price, discount_price, stock_quantity, is_available, image_url) VALUES
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Deva Pahadi Aloo (देसी आलू)', 'Fresh mountain potatoes, superior texture for frying & curries.', '1 kg', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Anand Aloo (Local Mandi)', 'Daily fresh local farm potatoes for everyday curries.', '1 kg', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Lal Pyaj (Onion)', 'Crisp dry red farm onions with rich pungent flavour.', '1 kg', 60.00, 58.00, 120, TRUE, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Lal Tamatar (Tomato)', 'Firm, juicy naturally ripened red desi tomatoes.', '1 kg', 200.00, 190.00, 80, TRUE, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Taza Desi Kheera (Cucumber)', 'Crispy refreshing desi salad cucumbers, cooling & hydrated.', '1 kg', 40.00, 38.00, 50, TRUE, 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Parwal (Pointed Gourd)', 'Farm-fresh tender pointed gourd for authentic North Indian curries.', '1 kg', 100.00, 95.00, 40, TRUE, 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Meetha Kaddu (Pumpkin)', 'Tender sweet yellow pumpkin slices for bhandara sabzi.', '1 kg', 40.00, 38.00, 40, TRUE, 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Gol Baingan (Eggplant)', 'Glossy purple round large eggplant ideal for smoky bharta.', '1 kg', 60.00, 58.00, 50, TRUE, 'https://images.unsplash.com/photo-1659261200842-8877b63fba11?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Nemi Baingan (Slender)', 'Tender seedless slender purple brinjals for quick stir fry.', '1 kg', 40.00, 38.00, 40, TRUE, 'https://images.unsplash.com/photo-1629853488812-70b5ee2e69bb?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Tori (Ridge Gourd)', 'Fresh green tender ridged gourd, freshly cut from vine.', '1 kg', 60.00, 58.00, 40, TRUE, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Green Shimla Mirch (Capsicum)', 'Crunchy glossy fresh green bell peppers for noodles & gravies.', '1 kg', 80.00, 75.00, 40, TRUE, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Teekhi Hari Mirch (Chillies)', 'Spicy sharp dark green farm chillies for everyday tadka.', '1 kg', 60.00, 58.00, 50, TRUE, 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Adrak (Ginger)', 'Aromatic spicy fresh raw ginger root with rich juice.', '1 kg', 120.00, 115.00, 50, TRUE, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Taza Lauki (Bottle Gourd)', 'Juicy long tender green bottle gourd, light and digestible.', '1 pc', 30.00, 28.00, 30, TRUE, 'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Chaulai Saag', 'Tender fresh green leafy chaulai saag, iron and fiber rich.', '1 bunch', 10.00, 10.00, 40, TRUE, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Komal Bhindi (Lady Finger)', 'Tender non-fibrous crispy green okra for bhindi masala.', '1 kg', 40.00, 38.00, 50, TRUE, 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Karela (Bitter Gourd)', 'Farm-fresh knobby bitter gourd, rich in health benefits.', '500 g', 60.00, 58.00, 30, TRUE, 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Phoolgobhi (Cauliflower)', 'Clean compact crisp white cauliflower head with green leaves.', '1 pc', 40.00, 38.00, 30, TRUE, 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Taza Hara Dhaniya (Coriander)', 'Fresh aromatic coriander leaves with roots for daily garnishing.', '250 g', 40.00, 38.00, 50, TRUE, 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Button Mushroom Pack', 'Sealed pack of organic plump white button mushrooms.', '200 g', 70.00, 65.00, 25, TRUE, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-02-produce', 'Desi Lehsun (Garlic)', 'Aromatic dried garlic bulbs with robust Indian punch.', '4 pcs', 20.00, 20.00, 60, TRUE, 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sarso Tel (Pure Mustard Oil)', 'Traditional kachi ghani pure mustard oil for authentic cooking.', '1 Litre', 200.00, 195.00, 60, TRUE, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Fortune Refined Oil', 'Refined edible sunflower cooking oil, light on heart.', '1 Litre', 160.00, 155.00, 50, TRUE, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Nutrela Soybean Oil', 'Pure refined soybean cooking oil packed with Vitamin A & D.', '1 Litre', 120.00, 115.00, 50, TRUE, 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Chakki Fresh Maida', 'Double-sifted refined flour for fluffy bhature, samosas & cakes.', '1 kg', 40.00, 38.00, 60, TRUE, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Shuddh Sooji / Rawa', 'Granulated pure wheat semolina for halwa, upma & idlis.', '1 kg', 50.00, 48.00, 50, TRUE, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Chana Besan (Gram Flour)', 'Pure roasted gram flour for crispy pakoras, kadhi & ladoos.', '1 kg', 100.00, 95.00, 60, TRUE, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Basmati Chawal (Special)', 'Long grain aromatic basmati rice for fragrant biryani & pulao.', '1 kg', 90.00, 85.00, 60, TRUE, 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Desi Arhar Daal (Toor)', 'Unpolished protein-rich toor dal for everyday nutritious meals.', '1 kg', 100.00, 95.00, 50, TRUE, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Bhuna Chana (Roasted)', 'Crispy high-protein roasted chickpeas with husk.', '1 kg', 110.00, 105.00, 40, TRUE, 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Thick Poha (Flattened Rice)', 'Clean beaten white rice flakes for quick morning breakfast.', '1 kg', 120.00, 110.00, 50, TRUE, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Shuddh Cheeni (Sugar)', 'Sparkling crystal white sugar, refined and sulfur-free.', '1 kg', 50.00, 48.00, 80, TRUE, 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Tata Namak (Salt)', 'Desh ka namak, vacuum evaporated iodized salt.', '1 kg', 30.00, 28.00, 100, TRUE, 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Tata Agni Kadak Chai', 'Extra strong Assam tea blend for energizing morning kadak chai.', '250 g', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Taaza Fresh Tea', 'Refreshing aromatic daily tea leaf for smooth flavour.', '250 g', 25.00, 25.00, 60, TRUE, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Italian Penne Pasta', '100% durum wheat semolina penne pasta for red and white sauce.', '1 kg', 60.00, 58.00, 40, TRUE, 'https://images.unsplash.com/photo-1551462147-37885acc36f1?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Chowmein Noodles Pack', 'Street style quick boiling noodles for wok toss chowmein.', '500 g', 30.00, 28.00, 50, TRUE, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Roasted Wheat Sewai', 'Thin golden pre-roasted vermicelli for meethi sewai & kheer.', '100 g', 10.00, 10.00, 80, TRUE, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'White Vinegar (Sirka)', 'Brewed pure white cooking vinegar for pickling and chinese food.', '500 g', 40.00, 38.00, 40, TRUE, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Navranga Desi Achar', 'Spiced traditional mango and mixed pickle cured in mustard oil.', '1 kg', 120.00, 115.00, 30, TRUE, 'https://images.unsplash.com/photo-1621996346565-e3d5d628169e?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Goldi Haldi Powder', 'Pure bright yellow ground turmeric powder for golden curry color.', '200 g', 65.00, 60.00, 60, TRUE, 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Goldi Lal Mirch Powder', 'Hot spicy red chilli powder for rich red curry color & heat.', '200 g', 75.00, 70.00, 60, TRUE, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Goldi Dhaniya Powder', 'Ground green aromatic coriander powder for rich gravy base.', '200 g', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sabut Jeera (Cumin)', 'Whole aromatic cumin seeds for fragrant tadka.', '200 g', 80.00, 75.00, 50, TRUE, 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Goldi Garam Masala', 'Aromatic roasted ground whole spices blend for royal finish.', '100 g', 110.00, 105.00, 50, TRUE, 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sicca Hing (Asafoetida)', 'Strong fragrant cooking hing powder for digestive tadka.', '70 g', 39.00, 39.00, 50, TRUE, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sting Energy Drink', 'Vibrant red caffeinated energy drink with strawberry kick.', '250 ml', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Thums Up Charged Cola', 'Strong spicy carbonated Indian cola, toofani taste.', '750 ml', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sprite Lemon Lime Fizz', 'Clear crisp green refreshing lemon lime carbonated beverage.', '750 ml', 50.00, 48.00, 60, TRUE, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Mountain Dew 2.25L', 'High energy citrus fizz party pack bottle.', '2.25 Litre', 100.00, 95.00, 30, TRUE, 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Maaza Mango Fruit Drink', 'Thick Alphonso mango pulp beverage, real mango indulgence.', '2 Litre', 100.00, 95.00, 30, TRUE, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Red Bull Energy Can', 'Silver & blue slim vitalizing energy can.', '250 ml', 130.00, 125.00, 40, TRUE, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Desi Ghee Gulab Jamun', 'Warm soft mawa gulab jamuns dipped in rich saffron sugar syrup.', '500 g', 150.00, 140.00, 40, TRUE, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Spongy Chena Rasgulla', 'Delicate spongy white chena rasgullas in aromatic sugar syrup.', '500 g', 140.00, 130.00, 40, TRUE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Shuddh Besan Ke Laddu', 'Aromatic roasted gram flour laddus crafted in pure desi ghee.', '500 g', 160.00, 150.00, 40, TRUE, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Cadbury Dairy Milk Crackle', 'Iconic milk chocolate bar filled with crispy rice crackles.', '1 pc', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Nestle KitKat Wafer Bar', 'Crispy wafer chocolate bar covered in smooth milk chocolate.', '1 pc', 20.00, 20.00, 100, TRUE, 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Cadbury 5 Star Chocolate', 'Chewy caramel and nougat chocolate bar in iconic gold wrapper.', '1 pc', 10.00, 10.00, 100, TRUE, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Parle-G Family Pack', 'Iconic glucose biscuits for chai dipping family bundle.', 'Family Pack', 60.00, 58.00, 60, TRUE, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Sunfeast Dark Fantasy Choco Fills', 'Rich dark cookie filled with molten chocolate core.', '100 g', 35.00, 35.00, 50, TRUE, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Maggi 2-Minute Masala Noodles', 'India favourite instant noodles with signature tastemaker spice.', '70 g', 15.00, 14.00, 120, TRUE, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'California Badam (Almonds)', 'Crunchy premium California raw almonds rich in Vitamin E.', '250 g', 250.00, 240.00, 40, TRUE, 'https://images.unsplash.com/photo-1508061252966-f7ac08f96d63?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'W320 White Kaju (Cashews)', 'Rich buttery whole white cashews grade W320.', '250 g', 250.00, 240.00, 40, TRUE, 'https://images.unsplash.com/photo-1536591375315-1b8368903277?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Phool Makhana (Fox Nuts)', 'Crisp roasted organic lotus seeds, calcium and protein rich.', '250 g', 280.00, 270.00, 40, TRUE, 'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Horlicks Chocolate Delight', 'Nourishing health drink mix jar with 23 vital nutrients.', '200 g', 119.00, 115.00, 40, TRUE, 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Complan Chocolate Drink', '100% milk protein clinical formula nutrition drink for children.', '500 g', 320.00, 299.00, 30, TRUE, 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Nestle Cerelac Wheat Apple Cherry', 'Infant cereal with milk (8-24 months) rich in iron and vitamins.', '300 g', 275.00, 260.00, 30, TRUE, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Nestle Cerelac Wheat Rice Mixed Fruit', 'Infant cereal with milk (10-24 months) with wholesome fruit bits.', '300 g', 299.00, 285.00, 30, TRUE, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Amulspray Infant Milk Food', 'Trusted infant milk substitute powder tin with milk proteins.', '500 g', 240.00, 230.00, 40, TRUE, 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'All Out Ultra Mosquito Liquid Refill', '60 nights long protection liquid mosquito vaporizer refill.', '45 ml', 100.00, 95.00, 50, TRUE, 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Johnson Baby Powder (25g)', 'Mild, gentle and clinical pure baby skin powder.', '25 g', 30.00, 30.00, 60, TRUE, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Godrej Cinthol Original Soap', 'Deodorant and complexion bath soap with 99.9% germ defence.', '70 g', 50.00, 48.00, 80, TRUE, 'https://images.unsplash.com/photo-1607006314592-806b3a0937c8?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Bonne Care Feeding Bottle', 'BPA-free polypropylene baby feeder with gentle liquid silicone nipple.', '250 ml', 55.00, 55.00, 40, TRUE, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-01-grocery', 'Bonne Kid Feeding Bottle', 'Compact 150ml silicone nipple feeder for easy feeding.', '150 ml', 50.00, 50.00, 40, TRUE, 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Special Kulhad Pizza (Pizza Paradise)', 'Traditional earthen kulhad baked pizza layered with sweet corn & double cheese.', '1 kulhad', 79.00, 79.00, 40, TRUE, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Cheese Overloaded Pizza (Pizza Paradise)', 'Rich mozzarella burst pizza on fresh hand-stretched crust.', 'Regular', 70.00, 70.00, 30, TRUE, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Paneer Tikka Pizza (Pizza Paradise)', 'Smoky tandoori paneer cubes, crisp capsicum and spiced makhani sauce.', 'Medium', 260.00, 249.00, 20, TRUE, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Stuffed Garlic Bread (Pizza Paradise)', 'Oven baked cheesy herb garlic bread filled with corn & jalapenos.', '1 pack', 119.00, 110.00, 25, TRUE, 'https://images.unsplash.com/photo-1619895092538-128341789043?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Hot Choco Lava Cake (Pizza Paradise)', 'Warm cocoa sponge cake with bubbling molten chocolate center.', '1 pc', 70.00, 65.00, 30, TRUE, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Aloo Tikki Burger (Pizza Paradise)', 'Toasted sesame seed bun with spiced crispy potato patty and mayo.', '1 pc', 49.00, 49.00, 40, TRUE, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Steamed Veg Momos (Bala Ji Restaurant)', 'Piping hot thin-skinned dumplings served with fiery garlic red chutney.', '6 pcs', 39.00, 39.00, 35, TRUE, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Hot Paneer Frankie Roll (Bala Ji)', 'Flaky lachha paratha wrap rolled with spicy roasted paneer tikka & mint chutney.', '1 pc', 40.00, 40.00, 30, TRUE, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Desi Veg Chowmein (Bala Ji)', 'Wok tossed street style noodles loaded with crunchy cabbage and bell pepper.', 'Half', 40.00, 40.00, 30, TRUE, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Fresh Black Forest Cake (Bala Ji Bakery)', 'Rich dark chocolate celebration cake topped with whipped cream and red cherries.', '500 g', 170.00, 160.00, 15, TRUE, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Special Dhaba Thali (Desi Dhaba)', 'Complete meal box: Shahi Paneer, Dal Makhani, 4 Butter Roti, Rice & Gulab Jamun.', '1 Thali', 200.00, 190.00, 30, TRUE, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Dhaba Kadhai Paneer (Desi Dhaba)', 'Fresh paneer chunks cooked in spicy bell pepper & tomato coriander gravy.', 'Full', 250.00, 239.00, 20, TRUE, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Dal Tadka Butter (Desi Dhaba)', 'Creamy yellow toor dal tempered with sizzling garlic, hing & pure butter.', 'Full', 140.00, 130.00, 30, TRUE, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-03-food', 'Tandoori Butter Roti (Desi Dhaba)', 'Traditional clay-oven tandoor baked whole wheat roti brushed with pure butter.', 'Pack of 4', 60.00, 55.00, 50, TRUE, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Dettol Antiseptic Liquid (60ml)', 'First-aid germ defence liquid for cuts, bites and household hygiene.', '60 ml', 45.63, 41.49, 50, TRUE, 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Dabur Chyawanprash (1kg)', '3X Immunity Ayurvedic herbal formulation enriched with Amla & 40+ herbs.', '1 kg', 430.00, 399.00, 30, TRUE, 'https://images.unsplash.com/photo-1617897903246-719242758050?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Dabur Gripe Water', 'Ayurvedic infant digestive tonic for colic relief and stomach comfort.', '125 ml', 63.00, 60.00, 40, TRUE, 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Dabur Janma Ghunti', 'Traditional infant Ayurvedic digestive tonic with Draksha & Anjeer.', '60 ml', 45.00, 42.00, 40, TRUE, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Zandu Balm Pain Relief', 'Fast absorption headache, cold & muscle pain relief herbal balm.', '8 g', 45.00, 42.00, 60, TRUE, 'https://images.unsplash.com/photo-1550572017-4fcdbb590e53?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Iodex Body Pain Expert', 'Fast acting Ayurvedic balm for quick relief from neck, shoulder & back pain.', '10 g', 45.00, 42.00, 60, TRUE, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Candid Dusting Powder', 'Expert anti-fungal skin solution for prickly heat, rashes & itching.', '100 g', 140.00, 130.00, 40, TRUE, 'https://images.unsplash.com/photo-1608248597359-216a695d5354?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Dabur Lal Tail (100ml)', 'Ayurvedic baby massage oil proven to improve bone and muscle strength.', '100 ml', 140.00, 135.00, 30, TRUE, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'ENO 3 in 1 Sixer Pack', 'Instant fruit salt acidity and gastric relief formula, works in 6 seconds.', '30 g', 60.00, 58.00, 80, TRUE, 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-04-pharma', 'Dermi Cool Prickly Heat Powder', 'Neem & Tulsi double cooling power for prickly heat and summer itch relief.', '150 g', 159.00, 149.00, 40, TRUE, 'https://images.unsplash.com/photo-1556228722-d0b5d194c79f?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-05-fashion', 'Inflatable Sofa with Ottoman', 'Single size luxurious velvet flocked lounge chair with matching footrest ottoman.', '1 set', 1299.00, 999.00, 15, TRUE, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-05-fashion', 'Pure Cotton Ankle Socks', 'Breathable combed cotton stretch ankle socks for daily gym and casual wear.', 'Pack of 3', 149.00, 129.00, 40, TRUE, 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'vivo V60e 5G Smartphone', 'AI studio portrait camera 5G smartphone with sleek curved AMOLED screen.', '1 pc', 28999.00, 27499.00, 10, TRUE, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'vivo V40 Pro 5G Smartphone', 'Zeiss professional optics flagship 5G mobile with Dimensity 9200+ chip.', '1 pc', 49999.00, 47999.00, 8, TRUE, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'realme 15x 5G (6GB/128GB)', 'High performance Dimensity 5G smartphone with ultra-smooth 120Hz display.', '1 pc', 15999.00, 14999.00, 12, TRUE, 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'OPPO K14x 5G (4GB/128GB)', 'Military-grade shock resistance and long-lasting battery 5G mobile.', '1 pc', 13999.00, 12999.00, 12, TRUE, 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'Redmi 15C 5G (6GB/128GB)', 'Massive 6000mAh battery with AI dual camera and in-box fast charger.', '1 pc', 12499.00, 11499.00, 15, TRUE, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'Nokia 105 Classic Keypad Phone', 'Built-in UPI feature phone, wireless FM radio with 1-year replacement guarantee.', '1 pc', 1499.00, 1399.00, 25, TRUE, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'Apple 20W USB-C Power Adapter', 'Original Apple Type-C fast charging power adapter for iPhone & iPad.', '1 pc', 1900.00, 1699.00, 25, TRUE, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'OnePlus SUPERVOOC 120W Charger', 'Ultra-fast 120W flash power adapter bundle with red Type-C cable.', '1 pc', 2499.00, 1999.00, 20, TRUE, 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'Samsung 120W Fast Power Adapter', 'Super-fast dual port dock charger for Galaxy devices.', '1 pc', 1999.00, 1499.00, 20, TRUE, 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'ERD TC-21 10W USB-A Dock Charger', 'Heavy duty 2A BIS-approved durable Indian wall socket adapter.', '1 pc', 299.00, 249.00, 40, TRUE, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'realme Buds Wireless Z3 Neckband', 'Magnetic on-off Bluetooth neckband with deep bass and fast charge.', '1 pc', 1499.00, 1299.00, 30, TRUE, 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'OnePlus Nord Buds 3r TWS', 'Crisp audio true wireless earbuds with Titanium diaphragm drivers.', '1 pc', 1999.00, 1799.00, 25, TRUE, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'CMF by Nothing Buds Pro', 'Hybrid Active Noise Cancellation 45dB earbuds with Ultra Bass Technology.', '1 pc', 2999.00, 2499.00, 20, TRUE, 'https://images.unsplash.com/photo-1578319439584-104c94d37305?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'CMF by Nothing Buds (Orange)', 'Signature vibrant orange roller dial case wireless earbuds with high-res audio.', '1 pc', 2499.00, 2199.00, 20, TRUE, 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'boAt Airdopes 171 X', 'Quad Mic ENx true wireless earbuds with ASAP fast charging.', '1 pc', 1499.00, 1199.00, 30, TRUE, 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'P9 Wireless Over-Ear Headphones', 'Foldable soft cushioned Bluetooth headphones with deep stereo acoustics.', '1 pc', 999.00, 699.00, 25, TRUE, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'SoRoo SR-588 Premium Soundbar', '8H Playtime Bluetooth home TV soundbar with thumping bass subwoofers.', '1 pc', 1799.00, 1399.00, 15, TRUE, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'CYOMI MAX 18 Cricket Ball Speaker', '5W Dhamaka high-clarity red cricket ball portable outdoor Bluetooth speaker.', '1 pc', 599.00, 449.00, 30, TRUE, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'YOROTO LOUD 8.0 Megaphone (दा भोंपू)', '300W Folding handle rechargeable announcement megaphone horn.', '1 pc', 1299.00, 899.00, 20, TRUE, 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'Protec Fall Detection Smartwatch', 'Senior safety fall detection smartwatch with SOS emergency calling.', '1 pc', 3499.00, 2999.00, 15, TRUE, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', '3-in-1 Mini Car Vacuum Cleaner (AS-228)', 'Cordless portable high-suction dust cleaner for car interiors and sofas.', '1 set', 899.00, 649.00, 25, TRUE, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'NOVA-NX N-6130 Hair Dryer', '1800W High power hot/cold salon style compact hair blow dryer.', '1 pc', 799.00, 549.00, 30, TRUE, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'Waterproof Bike Phone Holder', '360° Rotating motorcycle handlebar weather-proof touchscreen mobile mount.', '1 pc', 499.00, 349.00, 40, TRUE, 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500&q=80'),
('a0000000-0000-0000-0000-000000000001', 'cat-06-electronics', 'Multifunctional Metal Desktop Stand', '360° Rotating foldable aluminium alloy mobile and tablet desk stand.', '1 pc', 399.00, 249.00, 50, TRUE, 'https://images.unsplash.com/photo-1586105251270-4eb6250e7a2b?w=500&q=80');

-- =============================================================================
-- 4. Supabase Realtime Publication Validation
-- Run in Supabase SQL Editor to ensure Realtime is enabled on all live tables.
-- =============================================================================
-- Ensure critical tables are included in the Supabase realtime publication
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY['orders', 'order_items', 'products', 'riders', 'profiles'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND tablename = t
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
            RAISE NOTICE 'Added table % to supabase_realtime publication', t;
        ELSE
            RAISE NOTICE 'Table % already in supabase_realtime publication', t;
        END IF;
    END LOOP;
END $$;

-- =============================================================================
-- 5. Demo Customer Profile (for checkout fallback)
-- =============================================================================
INSERT INTO public.profiles (id, full_name, phone, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    NULL,
    '+91 98765 43210',
    'customer',
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SEED COMPLETE: 6 Categories + 124 Products verified for Joniha Hub BLZ-HUB-01
-- Realtime publication locked. Run this SQL in Supabase Dashboard SQL Editor.
-- =============================================================================
