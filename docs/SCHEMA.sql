-- =============================================================================
-- BELZO HYPERLOCAL QUICK-COMMERCE ECOSYSTEM — DATABASE DDL
-- Target Engine: PostgreSQL 15+ (Supabase Native)
-- Target Hub: Joniha Central Hub (26.0350, 80.4650), Bindki, UP
-- Version: 2.1.0 (Production Release)
-- =============================================================================

-- Enable required Postgres extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. ENUMS & DOMAINS
-- =============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'rider', 'store_operator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('placed', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cod', 'online');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- 2. CORE TABLES
-- =============================================================================

-- 2.1 Dark Stores / Fulfillment Hubs
CREATE TABLE IF NOT EXISTS public.dark_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    hub_code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    service_radius_km NUMERIC(4, 2) DEFAULT 5.00,
    contact_phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.2 Profiles (Maps directly to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(150),
    role user_role DEFAULT 'customer' NOT NULL,
    avatar_url TEXT,
    default_address JSONB,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.3 Couriers / Delivery Riders Fleet
CREATE TABLE IF NOT EXISTS public.riders (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) DEFAULT 'Motorcycle',
    vehicle_number VARCHAR(50) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    kyc_status kyc_status DEFAULT 'verified' NOT NULL,
    is_online BOOLEAN DEFAULT FALSE NOT NULL,
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    store_id UUID REFERENCES public.dark_stores(id),
    total_deliveries INTEGER DEFAULT 0 NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.4 Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.5 Catalog Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.dark_stores(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    stock_quantity INTEGER DEFAULT 50 NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.6 Orders Ledger
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number SERIAL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    store_id UUID REFERENCES public.dark_stores(id) ON DELETE RESTRICT NOT NULL,
    transferred_from_store_id UUID REFERENCES public.dark_stores(id) ON DELETE SET NULL,
    rider_id UUID REFERENCES public.riders(id) ON DELETE SET NULL,
    status order_status DEFAULT 'placed' NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    platform_fee NUMERIC(10, 2) DEFAULT 5.00 NOT NULL,
    payment_method payment_method DEFAULT 'cod' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    delivery_address JSONB NOT NULL,
    delivery_pin VARCHAR(4) NOT NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.7 Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    product_name_snapshot VARCHAR(255) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.8 Coupons & Promotions
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'flat' NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    max_discount NUMERIC(10, 2),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================================================
-- 3. INDEXES FOR HIGH-THROUGHPUT REALTIME DISPATCH
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_status ON public.orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_rider_status ON public.orders(rider_id, status);
CREATE INDEX IF NOT EXISTS idx_products_store_category ON public.products(store_id, category_id);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_riders_online ON public.riders(is_online) WHERE is_online = TRUE;

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.dark_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 4.1 Profiles Policy
CREATE POLICY "Public profiles are readable by self and staff" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'store_operator')
    ));

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4.2 Dark Stores & Catalog Policy (Read public, Write staff)
CREATE POLICY "Allow public read access to active dark stores" ON public.dark_stores
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Allow public read access to categories" ON public.categories
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (is_available = TRUE);

CREATE POLICY "Allow store operators to update products" ON public.products
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'store_operator')
    ));

-- 4.3 Orders Policy
CREATE POLICY "Customers can read their own orders" ON public.orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can insert orders" ON public.orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Store operators manage orders for their hub" ON public.orders
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'store_operator')
    ));

CREATE POLICY "Riders can read and update assigned orders" ON public.orders
    FOR ALL USING (rider_id = auth.uid() OR (status = 'ready_for_pickup' AND rider_id IS NULL));

-- 4.4 Order Items Policy
CREATE POLICY "Users read order items for viewable orders" ON public.order_items
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (
            orders.customer_id = auth.uid() OR orders.rider_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'store_operator')
            )
        )
    ));

CREATE POLICY "Customers can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
    ));

-- =============================================================================
-- 5. REALTIME PUBLICATION SETUP
-- =============================================================================

-- Add high-velocity tables to the Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.riders;

-- =============================================================================
-- 6. JONIHA SEED DATA (Fulfillment Hub, Categories, and Catalog)
-- =============================================================================

-- 6.1 Insert Primary Joniha Dark Store Hub
INSERT INTO public.dark_stores (id, name, hub_code, address, latitude, longitude, service_radius_km, contact_phone, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Belzo Joniha Central Hub 01',
    'BLZ-UP-JON01',
    'Joniha Chauraha, Bindki Road, Fatehpur, UP - 212635',
    26.0350000,
    80.4650000,
    5.00,
    '+919876543210',
    TRUE
) ON CONFLICT (hub_code) DO UPDATE 
SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, service_radius_km = EXCLUDED.service_radius_km;

-- 6.2 Insert Standard Categories
INSERT INTO public.categories (id, name, slug, icon, sort_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'Dairy & Eggs', 'dairy', 'milk', 1),
('c0000000-0000-0000-0000-000000000002', 'Fresh Produce', 'produce', 'carrot', 2),
('c0000000-0000-0000-0000-000000000003', 'Bakery & Bread', 'bakery', 'croissant', 3),
('c0000000-0000-0000-0000-000000000004', 'Snacks & Drinks', 'snacks', 'cookie', 4),
('c0000000-0000-0000-0000-000000000005', 'Pharmacy & Care', 'pharma', 'pill', 5),
('c0000000-0000-0000-0000-000000000006', 'Fast Tech & Cable', 'tech', 'zap', 6)
ON CONFLICT (slug) DO NOTHING;

-- 6.3 Insert Core Verified Catalog for Joniha Hub
INSERT INTO public.products (store_id, category_id, name, description, unit, price, discount_price, stock_quantity, is_available, image_url) VALUES
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Amul Taaza Fresh Toned Milk', 'Pasteurized toned milk with 3.0% fat, 8.5% SNF.', '500 ml', 34.00, 32.00, 60, TRUE, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Harvest Gold 100% Atta Brown Bread', 'Wholesome brown bread packed with dietary fibre.', '400 g', 49.00, 45.00, 40, TRUE, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Farm Fresh Red Ripe Tomatoes', 'Locally sourced desi tomatoes from Fatehpur belt.', '1 kg', 38.00, 32.00, 80, TRUE, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Organic Hass Avocado (Pack of 2)', 'Creamy imported avocados ready to eat.', '2 pcs', 189.00, 169.00, 20, TRUE, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Type-C Fast Braided Charging Cable', '100W Power Delivery durable nylon braided cable.', '1.2 m', 299.00, 249.00, 25, TRUE, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Electrolyte Hydration Powder (Lime)', 'Rapid rehydration energy electrolyte sachets.', '5 sachets', 99.00, 85.00, 50, TRUE, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80')
ON CONFLICT DO NOTHING;
