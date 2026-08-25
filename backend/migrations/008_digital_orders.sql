-- Upgrade legacy installations and add digital delivery/payment audit fields.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE orders RENAME COLUMN total TO total_price;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'price_at_purchase'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'price'
  ) THEN
    ALTER TABLE order_items RENAME COLUMN price_at_purchase TO price;
  END IF;
END $$;

ALTER TABLE products ADD COLUMN IF NOT EXISTS download_path VARCHAR(500);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE orders ALTER COLUMN shipping_address DROP NOT NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  payment_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id, status)
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_order_id
  ON payment_webhook_events(order_id);
