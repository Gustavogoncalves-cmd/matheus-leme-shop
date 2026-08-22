-- Add MercadoPago integration fields to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS mercadopago_preference_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id VARCHAR(255),
  RENAME COLUMN total TO total_price;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_orders_mercadopago_preference_id ON orders(mercadopago_preference_id);
CREATE INDEX IF NOT EXISTS idx_orders_mercadopago_payment_id ON orders(mercadopago_payment_id);

-- Add new statuses to support payment-related states
-- Status list: 'pending' -> 'paid' -> 'processing' -> 'shipped' -> 'delivered'
--              'pending_payment' (waiting for payment confirmation)
--              'payment_failed' (payment declined/rejected)
COMMENT ON COLUMN orders.status IS 'Status values: pending, pending_payment, paid, payment_failed, processing, shipped, delivered, cancelled';
