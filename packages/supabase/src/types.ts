/**
 * Belzo Database & Schema Typings
 * Source of truth mapped directly from docs/SCHEMA.sql
 */

export type UserRole = 'customer' | 'rider' | 'store_operator' | 'admin';

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'cod' | 'upi' | 'card' | 'wallet' | 'netbanking';

export type VehicleType = 'bicycle' | 'motorcycle' | 'scooter' | 'ev_bike';

export interface Profile {
  id: string;
  phone: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DarkStore {
  id: string;
  name: string;
  code: string;
  address: string;
  lat: number;
  lng: number;
  service_radius_km: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  icon_name: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  dark_store_id: string | null;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  unit: string;
  mrp: number;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  media_urls: string[];
  is_available: boolean;
  barcode: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  recipient_phone: string;
  house_flat_no: string;
  apartment_road_area: string;
  landmark: string | null;
  city: string;
  postal_code: string;
  lat: number;
  lng: number;
  is_default: boolean;
  delivery_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rider {
  id: string;
  vehicle_type: VehicleType;
  vehicle_number: string;
  driving_license_no: string | null;
  is_online: boolean;
  current_lat: number | null;
  current_lng: number | null;
  last_ping: string | null;
  is_verified: boolean;
  assigned_dark_store_id: string | null;
  active_order_id: string | null;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  rider_id: string | null;
  dark_store_id: string;
  store_id?: string;
  transferred_from_store_id?: string | null;
  status: OrderStatus;
  items_total: number;
  discount_amount: number;
  delivery_fee: number;
  surge_fee: number;
  tip_amount: number;
  net_payable: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_transaction_id: string | null;
  delivery_address_snapshot: Record<string, any>;
  delivery_otp: string;
  cancellation_reason: string | null;
  placed_at: string;
  accepted_at: string | null;
  prepared_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  item_snapshot: Record<string, any>;
  created_at: string;
}

/**
 * Database definitions for Supabase Client
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; phone: string };
        Update: Partial<Profile>;
      };
      dark_stores: {
        Row: DarkStore;
        Insert: Partial<DarkStore> & { name: string; code: string; address: string; lat: number; lng: number };
        Update: Partial<DarkStore>;
      };
      categories: {
        Row: Category;
        Insert: Partial<Category> & { name: string; slug: string; vertical: string };
        Update: Partial<Category>;
      };
      products: {
        Row: Product;
        Insert: Partial<Product> & { category_id: string; name: string; slug: string; unit: string; mrp: number; price: number };
        Update: Partial<Product>;
      };
      addresses: {
        Row: Address;
        Insert: Partial<Address> & { user_id: string; recipient_name: string; recipient_phone: string; house_flat_no: string; apartment_road_area: string; city: string; postal_code: string; lat: number; lng: number };
        Update: Partial<Address>;
      };
      riders: {
        Row: Rider;
        Insert: Partial<Rider> & { id: string; vehicle_number: string };
        Update: Partial<Rider>;
      };
      orders: {
        Row: Order;
        Insert: Partial<Order> & { order_number: string; customer_id: string; dark_store_id: string; items_total: number; net_payable: number; delivery_address_snapshot: Record<string, any> };
        Update: Partial<Order>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Partial<OrderItem> & { order_id: string; product_id: string; product_name: string; unit_price: number; quantity: number; total_price: number };
        Update: Partial<OrderItem>;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      vehicle_type: VehicleType;
    };
  };
}
