-- =====================================================================
-- Belzo Hyperlocal Quick-Commerce Ecosystem
-- Supabase PostgreSQL Schema & Security Specification
-- File: docs/SCHEMA.sql
-- =====================================================================

-- Enable essential extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. ENUMS & DOMAIN TYPES
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('customer', 'rider', 'store_operator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM (
        'placed',
        'accepted',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM (
        'pending',
        'paid',
        'failed',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_method AS ENUM (
        'cod',
        'upi',
        'card',
        'wallet',
        'netbanking'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.vehicle_type AS ENUM (
        'bicycle',
        'motorcycle',
        'scooter',
        'ev_bike'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ---------------------------------------------------------------------
-- 2. CORE TABLES
-- ---------------------------------------------------------------------

-- 2.1 User Profiles (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    role public.user_role NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for role-based lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 2.2 Dark Stores / Fulfillment Hubs
CREATE TABLE IF NOT EXISTS public.dark_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g. BLZ-BLR-KOR-01
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    service_radius_km NUMERIC(4, 2) NOT NULL DEFAULT 4.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 Product Categories (6 Core Verticals)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    vertical VARCHAR(50) NOT NULL,
    icon_name VARCHAR(50),
    image_url TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 Products Master Catalog
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dark_store_id UUID REFERENCES public.dark_stores(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL, -- e.g. 500g, 1L, Pack of 2
    mrp NUMERIC(10, 2) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    is_available BOOLEAN NOT NULL DEFAULT true,
    barcode VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_dark_store ON public.products(dark_store_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);

-- 2.5 Customer Saved Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label VARCHAR(30) NOT NULL DEFAULT 'Home', -- Home, Work, Other
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    house_flat_no VARCHAR(100) NOT NULL,
    apartment_road_area TEXT NOT NULL,
    landmark VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    delivery_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- 2.6 Delivery Partners (Riders)
CREATE TABLE IF NOT EXISTS public.riders (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type public.vehicle_type NOT NULL DEFAULT 'motorcycle',
    vehicle_number VARCHAR(30) NOT NULL,
    driving_license_no VARCHAR(50),
    is_online BOOLEAN NOT NULL DEFAULT false,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    last_ping TIMESTAMPTZ,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    assigned_dark_store_id UUID REFERENCES public.dark_stores(id) ON DELETE SET NULL,
    active_order_id UUID,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_riders_is_online ON public.riders(is_online);
CREATE INDEX IF NOT EXISTS idx_riders_location ON public.riders(current_lat, current_lng);

-- 2.7 Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    rider_id UUID REFERENCES public.riders(id) ON DELETE SET NULL,
    dark_store_id UUID NOT NULL REFERENCES public.dark_stores(id) ON DELETE RESTRICT,
    store_id UUID REFERENCES public.dark_stores(id) ON DELETE RESTRICT,
    transferred_from_store_id UUID REFERENCES public.dark_stores(id) ON DELETE SET NULL,
    status public.order_status NOT NULL DEFAULT 'placed',
    
    -- Financials
    items_total NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    surge_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tip_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    net_payable NUMERIC(10, 2) NOT NULL,
    
    -- Payment
    payment_method public.payment_method NOT NULL DEFAULT 'cod',
    payment_status public.payment_status NOT NULL DEFAULT 'pending',
    payment_transaction_id VARCHAR(100),
    
    -- Snapshot & Delivery Verification
    delivery_address_snapshot JSONB NOT NULL,
    delivery_otp VARCHAR(6) NOT NULL DEFAULT floor(random() * (9999 - 1000 + 1) + 1000)::text,
    cancellation_reason TEXT,
    
    -- Milestones
    placed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    accepted_at TIMESTAMPTZ,
    prepared_at TIMESTAMPTZ,
    out_for_delivery_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON public.orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_dark_store ON public.orders(dark_store_id);

-- 2.8 Order Line Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name VARCHAR(200) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    item_snapshot JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ---------------------------------------------------------------------
-- 3. AUTOMATED TRIGGERS & FUNCTIONS
-- ---------------------------------------------------------------------

-- 3.1 Generic updated_at timestamp refresher
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    CREATE TRIGGER tr_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    CREATE TRIGGER tr_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    CREATE TRIGGER tr_riders_updated_at BEFORE UPDATE ON public.riders FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3.2 Auto-create profile on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, phone, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.phone, 'temp_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Belzo Member'),
        'customer'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- 3.3 Helper function to check caller's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---------------------------------------------------------------------
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dark_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4.1 Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.current_user_role() = 'admin');

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4.2 Categories & Dark Stores Policies (Public Read, Admin Write)
CREATE POLICY "Categories are readable by everyone"
    ON public.categories FOR SELECT
    USING (is_active = true OR public.current_user_role() = 'admin');

CREATE POLICY "Admins have full access on categories"
    ON public.categories FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Dark stores readable by authenticated users"
    ON public.dark_stores FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins have full access on dark stores"
    ON public.dark_stores FOR ALL
    USING (public.current_user_role() = 'admin');

-- 4.3 Products Policies
CREATE POLICY "Active products readable by all"
    ON public.products FOR SELECT
    USING (is_available = true OR public.current_user_role() IN ('admin', 'store_operator'));

CREATE POLICY "Store operators can update product price and availability"
    ON public.products FOR UPDATE
    USING (public.current_user_role() IN ('store_operator', 'admin'))
    WITH CHECK (public.current_user_role() IN ('store_operator', 'admin'));

CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (public.current_user_role() = 'admin');

-- 4.4 Addresses Policies
CREATE POLICY "Users can view and manage own addresses"
    ON public.addresses FOR ALL
    USING (auth.uid() = user_id OR public.current_user_role() = 'admin');

-- 4.5 Riders Policies
CREATE POLICY "Riders can view and update own status"
    ON public.riders FOR ALL
    USING (auth.uid() = id OR public.current_user_role() = 'admin');

CREATE POLICY "Customers can view assigned rider location"
    ON public.riders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.rider_id = riders.id 
            AND orders.customer_id = auth.uid() 
            AND orders.status = 'out_for_delivery'
        )
    );

-- 4.6 Orders Policies
CREATE POLICY "Customers can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Riders can view assigned or pending pickup orders"
    ON public.orders FOR SELECT
    USING (
        rider_id = auth.uid() 
        OR (status = 'ready_for_pickup' AND public.current_user_role() = 'rider')
    );

CREATE POLICY "Riders can update their accepted orders"
    ON public.orders FOR UPDATE
    USING (rider_id = auth.uid())
    WITH CHECK (rider_id = auth.uid());

CREATE POLICY "Store operators can view and process orders for their dark store"
    ON public.orders FOR SELECT
    USING (public.current_user_role() IN ('store_operator', 'admin'));

CREATE POLICY "Store operators can update order status, assign riders, or transfer hubs"
    ON public.orders FOR UPDATE
    USING (public.current_user_role() IN ('store_operator', 'admin'))
    WITH CHECK (public.current_user_role() IN ('store_operator', 'admin'));

CREATE POLICY "Admins have full control over orders"
    ON public.orders FOR ALL
    USING (public.current_user_role() = 'admin');

-- 4.7 Order Items Policies
CREATE POLICY "Order items visible to order owner, assigned rider, or admin"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.customer_id = auth.uid() OR orders.rider_id = auth.uid() OR public.current_user_role() = 'admin')
        )
    );

CREATE POLICY "Customers can insert items when placing order"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.customer_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------
-- 5. REALTIME REPLICATION CONFIGURATION
-- ---------------------------------------------------------------------
-- Enable PostgreSQL CDC replication for live tracking and dispatch
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.riders;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ---------------------------------------------------------------------
-- 6. PRE-SEEDED VERTICAL CATEGORIES & SEED DATA
-- ---------------------------------------------------------------------

INSERT INTO public.categories (name, slug, vertical, icon_name, sort_order) VALUES
    ('Grocery & Staples', 'grocery-staples', 'Grocery', 'shopping-basket', 1),
    ('Fresh Fruits & Vegetables', 'fruits-vegetables', 'Fruits & Vegetables', 'apple', 2),
    ('Food & Restaurant Kitchen', 'food-restaurant', 'Food & Restaurant', 'utensils', 3),
    ('Medicine & Daily Health', 'medicine-healthcare', 'Medicine & Healthcare', 'pill', 4),
    ('Fashion & Daily Wear', 'fashion-lifestyle', 'Fashion', 'shirt', 5),
    ('Electronics & Accessories', 'electronics-appliances', 'Electronics', 'smartphone', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed a default Dark Store hub
INSERT INTO public.dark_stores (name, code, address, lat, lng, service_radius_km)
VALUES 
    ('Belzo Central Hub - Koramangala', 'BLZ-BLR-KOR-01', '14, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034', 12.934533, 77.626579, 4.5)
ON CONFLICT (code) DO NOTHING;
