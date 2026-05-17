-- Schema for the Express API database (safespace_app).
-- Runs once on first container init. Catalog rows are not inserted here; add services via your admin flow.
\connect safespace_app

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  google_sub text UNIQUE,
  password_hash text,
  auth_provider text NOT NULL DEFAULT 'google',
  is_email_verified boolean NOT NULL DEFAULT false,
  display_name text,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  starts_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid,
  user_id uuid REFERENCES users (id) ON DELETE SET NULL,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS orders_order_code_seq START 1001;

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  payment_session_id text UNIQUE NOT NULL,
  order_code text UNIQUE DEFAULT ('ORD-' || lpad(nextval('orders_order_code_seq')::text, 6, '0')),
  idempotency_key text,
  status text NOT NULL DEFAULT 'PENDING_PAYMENT',
  total_amount_cents integer NOT NULL CHECK (total_amount_cents >= 0),
  currency text NOT NULL DEFAULT 'lkr',
  items_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments
  ADD CONSTRAINT payments_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE SET NULL;

CREATE TABLE password_reset_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user_id ON bookings (user_id);
CREATE INDEX idx_bookings_service_id ON bookings (service_id);
CREATE INDEX idx_payments_user_id ON payments (user_id);
CREATE INDEX idx_payments_stripe_session_id ON payments (stripe_session_id);
CREATE INDEX idx_payments_order_id ON payments (order_id);
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE UNIQUE INDEX idx_orders_user_idempotency
  ON orders (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_password_reset_otps_user_id ON password_reset_otps (user_id);
