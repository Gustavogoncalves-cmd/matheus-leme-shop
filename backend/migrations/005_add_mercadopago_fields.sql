-- Add Mercado Pago identifiers. Legacy column renames are handled in migration 008.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS mercadopago_preference_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_orders_mercadopago_preference_id ON orders(mercadopago_preference_id);
CREATE INDEX IF NOT EXISTS idx_orders_mercadopago_payment_id ON orders(mercadopago_payment_id);

COMMENT ON COLUMN orders.status IS 'Status values: pending_payment, paid, payment_failed, refunded, cancelled';
