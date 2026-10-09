/**
 * WhatsApp Order Dispatch Message Generator for Belzo Store Operator Terminal
 * Generates formatted instant dispatch messages with order checklist, bill breakdown, and Google Maps pin.
 */

export interface WhatsAppOrderAddress {
  street?: string;
  area?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
}

export interface WhatsAppOrderItem {
  quantity?: number;
  qty?: number;
  product?: {
    name: string;
    unit: string;
    price: number;
  };
  name?: string;
  unit?: string;
  price?: number;
}

export interface WhatsAppOrderPayload {
  id: string;
  order_number?: string;
  orderNumber?: string;
  created_at?: string | Date;
  placedAt?: Date | string;
  delivery_address?: WhatsAppOrderAddress;
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  items: WhatsAppOrderItem[];
  total_amount?: number;
  totalAmount?: number;
  payment_method?: string;
  paymentMethod?: string;
  customer_phone?: string;
  customerPhone?: string;
  customer_name?: string;
  customerName?: string;
}

/**
 * Builds a clean, readable WhatsApp formatted text message for instant dispatch.
 */
export function buildWhatsAppOrderMessage(
  order: WhatsAppOrderPayload,
  storePhone?: string
): string {
  // Normalize Order ID
  const orderId = (order.orderNumber || order.order_number || order.id || 'ORDER').slice(0, 8).toUpperCase();

  // Normalize Time
  const dateObj = order.created_at
    ? new Date(order.created_at)
    : order.placedAt
    ? new Date(order.placedAt)
    : new Date();
  const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Normalize Location
  const street = order.delivery_address?.street || order.address?.split(',')[0]?.trim() || 'Ward No. 4, Shahbajpur';
  const area =
    order.delivery_address?.area ||
    order.address?.split(',').slice(1).join(',').trim() ||
    'Joniha, Bindki Road';
  const landmark = order.delivery_address?.landmark || order.landmark || 'Near Joniha Chauraha';

  // Coordinates: Default to Joniha Hub center area if not specifically attached
  const lat = order.delivery_address?.latitude ?? order.latitude ?? 26.035;
  const lng = order.delivery_address?.longitude ?? order.longitude ?? 80.465;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  // Normalize Items
  const itemsText = (order.items || []).map((item) => {
    const qty = item.quantity ?? item.qty ?? 1;
    const name = item.product?.name ?? item.name ?? 'Item';
    const unit = item.product?.unit ?? item.unit ?? '1 unit';
    const price = item.product?.price ?? item.price ?? 0;
    const itemTotal = price * qty;
    return `• ${qty}x ${name} (${unit}) — ₹${itemTotal}`;
  }).join('\n');

  // Normalize Financials & Contact
  const totalAmount = order.total_amount ?? order.totalAmount ?? 0;
  const paymentMethod = (order.payment_method || order.paymentMethod || 'COD').toUpperCase();
  const customerPhone =
    order.customer_phone ||
    order.customerPhone ||
    (order.delivery_address?.phone ? `+91 ${order.delivery_address.phone}` : '+91 98765 43210');

  return [
    `📦 *BELZO INSTANT DISPATCH — NEW ORDER*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🆔 *Order ID:* #${orderId}`,
    `⏰ *Time:* ${timeFormatted}`,
    ``,
    `📍 *DELIVERY LOCATION:*`,
    `${street}, ${area}`,
    `📌 *Landmark:* ${landmark}`,
    `🗺️ *Google Maps Pin:* ${mapsUrl}`,
    ``,
    `🛍️ *ORDER CHECKLIST:*`,
    `${itemsText}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `💵 *Bill Amount:* ₹${totalAmount}`,
    `💳 *Payment Mode:* ${paymentMethod}`,
    `📞 *Customer Phone:* ${customerPhone}`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `⚡ *Belzo Joniha Hub 01 • Bindki*`,
  ].join('\n');
}

/**
 * Creates a WhatsApp click-to-chat URL with the encoded message
 */
export function getWhatsAppDispatchUrl(phoneNumber: string, message: string): string {
  // Strip non-digit characters except leading plus
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
