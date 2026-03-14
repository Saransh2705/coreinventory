-- =============================================
-- Operations Tables: Receipts, Deliveries, Transfers, Adjustments, Move History
-- =============================================

-- =============================================
-- DROP EXISTING OBJECTS (for re-running migration)
-- =============================================

-- Drop view
DROP VIEW IF EXISTS public.dashboard_kpis CASCADE;

-- Drop policies
DROP POLICY IF EXISTS "System can insert move_history" ON public.move_history;
DROP POLICY IF EXISTS "Authenticated can view move_history" ON public.move_history;
DROP POLICY IF EXISTS "Managers can create adjustments" ON public.adjustments;
DROP POLICY IF EXISTS "Authenticated can view adjustments" ON public.adjustments;
DROP POLICY IF EXISTS "Managers can manage transfer_items" ON public.transfer_items;
DROP POLICY IF EXISTS "Authenticated can view transfer_items" ON public.transfer_items;
DROP POLICY IF EXISTS "Managers can manage transfers" ON public.transfers;
DROP POLICY IF EXISTS "Authenticated can view transfers" ON public.transfers;
DROP POLICY IF EXISTS "Managers can manage delivery_items" ON public.delivery_items;
DROP POLICY IF EXISTS "Authenticated can view delivery_items" ON public.delivery_items;
DROP POLICY IF EXISTS "Managers can manage deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Authenticated can view deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Managers can manage receipt_items" ON public.receipt_items;
DROP POLICY IF EXISTS "Authenticated can view receipt_items" ON public.receipt_items;
DROP POLICY IF EXISTS "Managers can manage receipts" ON public.receipts;
DROP POLICY IF EXISTS "Authenticated can view receipts" ON public.receipts;

-- Drop triggers
DROP TRIGGER IF EXISTS update_transfers_updated_at ON public.transfers;
DROP TRIGGER IF EXISTS update_deliveries_updated_at ON public.deliveries;
DROP TRIGGER IF EXISTS update_receipts_updated_at ON public.receipts;
DROP TRIGGER IF EXISTS generate_move_code ON public.move_history;
DROP TRIGGER IF EXISTS generate_adjustment_code ON public.adjustments;
DROP TRIGGER IF EXISTS generate_transfer_code ON public.transfers;
DROP TRIGGER IF EXISTS generate_delivery_code ON public.deliveries;
DROP TRIGGER IF EXISTS generate_receipt_code ON public.receipts;

-- Drop functions
DROP FUNCTION IF EXISTS public.generate_move_code() CASCADE;
DROP FUNCTION IF EXISTS public.generate_adjustment_code() CASCADE;
DROP FUNCTION IF EXISTS public.generate_transfer_code() CASCADE;
DROP FUNCTION IF EXISTS public.generate_delivery_code() CASCADE;
DROP FUNCTION IF EXISTS public.generate_receipt_code() CASCADE;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS public.move_history CASCADE;
DROP TABLE IF EXISTS public.adjustments CASCADE;
DROP TABLE IF EXISTS public.transfer_items CASCADE;
DROP TABLE IF EXISTS public.transfers CASCADE;
DROP TABLE IF EXISTS public.delivery_items CASCADE;
DROP TABLE IF EXISTS public.deliveries CASCADE;
DROP TABLE IF EXISTS public.receipt_items CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;

-- Drop types
DROP TYPE IF EXISTS transfer_status CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS receipt_status CASCADE;

-- =============================================
-- CREATE NEW OBJECTS
-- =============================================

-- Enums
CREATE TYPE receipt_status AS ENUM ('Draft', 'Waiting', 'Ready', 'Done', 'Cancelled');
CREATE TYPE delivery_status AS ENUM ('Draft', 'Waiting', 'Ready', 'Done');
CREATE TYPE transfer_status AS ENUM ('Scheduled', 'In Transit', 'Done');

-- =============================================
-- RECEIPTS (incoming stock from suppliers)
-- =============================================
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_code TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  status receipt_status NOT NULL DEFAULT 'Draft',
  notes TEXT,
  received_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(receipt_id, product_id, location_id)
);

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX receipts_warehouse_idx ON public.receipts(warehouse_id);
CREATE INDEX receipts_status_idx ON public.receipts(status);
CREATE INDEX receipts_created_at_idx ON public.receipts(created_at DESC);
CREATE INDEX receipt_items_receipt_idx ON public.receipt_items(receipt_id);
CREATE INDEX receipt_items_product_idx ON public.receipt_items(product_id);

-- =============================================
-- DELIVERIES (outgoing stock to customers)
-- =============================================
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  status delivery_status NOT NULL DEFAULT 'Draft',
  notes TEXT,
  delivery_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.delivery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(delivery_id, product_id, location_id)
);

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX deliveries_warehouse_idx ON public.deliveries(warehouse_id);
CREATE INDEX deliveries_status_idx ON public.deliveries(status);
CREATE INDEX deliveries_created_at_idx ON public.deliveries(created_at DESC);
CREATE INDEX delivery_items_delivery_idx ON public.delivery_items(delivery_id);
CREATE INDEX delivery_items_product_idx ON public.delivery_items(product_id);

-- =============================================
-- TRANSFERS (internal movement between locations)
-- =============================================
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_code TEXT NOT NULL UNIQUE,
  from_location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  to_location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  status transfer_status NOT NULL DEFAULT 'Scheduled',
  notes TEXT,
  scheduled_date DATE,
  completed_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_location_id != to_location_id)
);

CREATE TABLE public.transfer_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_id UUID NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(transfer_id, product_id)
);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX transfers_from_location_idx ON public.transfers(from_location_id);
CREATE INDEX transfers_to_location_idx ON public.transfers(to_location_id);
CREATE INDEX transfers_status_idx ON public.transfers(status);
CREATE INDEX transfers_created_at_idx ON public.transfers(created_at DESC);
CREATE INDEX transfer_items_transfer_idx ON public.transfer_items(transfer_id);
CREATE INDEX transfer_items_product_idx ON public.transfer_items(product_id);

-- =============================================
-- ADJUSTMENTS (stock corrections)
-- =============================================
CREATE TABLE public.adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_code TEXT NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  before_quantity INTEGER NOT NULL CHECK (before_quantity >= 0),
  after_quantity INTEGER NOT NULL CHECK (after_quantity >= 0),
  difference INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.adjustments ENABLE ROW LEVEL SECURITY;

CREATE INDEX adjustments_product_idx ON public.adjustments(product_id);
CREATE INDEX adjustments_warehouse_idx ON public.adjustments(warehouse_id);
CREATE INDEX adjustments_created_at_idx ON public.adjustments(created_at DESC);

-- =============================================
-- MOVE HISTORY (audit trail)
-- =============================================
CREATE TABLE public.move_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_code TEXT NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reference_type TEXT NOT NULL, -- 'receipt', 'delivery', 'transfer', 'adjustment'
  reference_id UUID NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.move_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX move_history_product_idx ON public.move_history(product_id);
CREATE INDEX move_history_reference_idx ON public.move_history(reference_type, reference_id);
CREATE INDEX move_history_created_at_idx ON public.move_history(created_at DESC);

-- =============================================
-- AUTO-GENERATE SHORT CODES
-- =============================================

-- Receipts
CREATE OR REPLACE FUNCTION public.generate_receipt_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  next_num INT;
  new_code TEXT;
BEGIN
  IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
    SELECT COALESCE(MAX(
      CASE WHEN short_code ~ '^REC-\d+$'
      THEN CAST(SUBSTRING(short_code FROM 5) AS INT)
      ELSE 0 END
    ), 0) + 1 INTO next_num FROM public.receipts;
    new_code := 'REC-' || LPAD(next_num::TEXT, 4, '0');
    WHILE EXISTS (SELECT 1 FROM public.receipts WHERE short_code = new_code) LOOP
      next_num := next_num + 1;
      new_code := 'REC-' || LPAD(next_num::TEXT, 4, '0');
    END LOOP;
    NEW.short_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_receipt_code
  BEFORE INSERT ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.generate_receipt_code();

-- Deliveries
CREATE OR REPLACE FUNCTION public.generate_delivery_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  next_num INT;
  new_code TEXT;
BEGIN
  IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
    SELECT COALESCE(MAX(
      CASE WHEN short_code ~ '^DEL-\d+$'
      THEN CAST(SUBSTRING(short_code FROM 5) AS INT)
      ELSE 0 END
    ), 0) + 1 INTO next_num FROM public.deliveries;
    new_code := 'DEL-' || LPAD(next_num::TEXT, 4, '0');
    WHILE EXISTS (SELECT 1 FROM public.deliveries WHERE short_code = new_code) LOOP
      next_num := next_num + 1;
      new_code := 'DEL-' || LPAD(next_num::TEXT, 4, '0');
    END LOOP;
    NEW.short_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_delivery_code
  BEFORE INSERT ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.generate_delivery_code();

-- Transfers
CREATE OR REPLACE FUNCTION public.generate_transfer_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  next_num INT;
  new_code TEXT;
BEGIN
  IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
    SELECT COALESCE(MAX(
      CASE WHEN short_code ~ '^TRF-\d+$'
      THEN CAST(SUBSTRING(short_code FROM 5) AS INT)
      ELSE 0 END
    ), 0) + 1 INTO next_num FROM public.transfers;
    new_code := 'TRF-' || LPAD(next_num::TEXT, 4, '0');
    WHILE EXISTS (SELECT 1 FROM public.transfers WHERE short_code = new_code) LOOP
      next_num := next_num + 1;
      new_code := 'TRF-' || LPAD(next_num::TEXT, 4, '0');
    END LOOP;
    NEW.short_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_transfer_code
  BEFORE INSERT ON public.transfers
  FOR EACH ROW EXECUTE FUNCTION public.generate_transfer_code();

-- Adjustments
CREATE OR REPLACE FUNCTION public.generate_adjustment_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  next_num INT;
  new_code TEXT;
BEGIN
  IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
    SELECT COALESCE(MAX(
      CASE WHEN short_code ~ '^ADJ-\d+$'
      THEN CAST(SUBSTRING(short_code FROM 5) AS INT)
      ELSE 0 END
    ), 0) + 1 INTO next_num FROM public.adjustments;
    new_code := 'ADJ-' || LPAD(next_num::TEXT, 4, '0');
    WHILE EXISTS (SELECT 1 FROM public.adjustments WHERE short_code = new_code) LOOP
      next_num := next_num + 1;
      new_code := 'ADJ-' || LPAD(next_num::TEXT, 4, '0');
    END LOOP;
    NEW.short_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_adjustment_code
  BEFORE INSERT ON public.adjustments
  FOR EACH ROW EXECUTE FUNCTION public.generate_adjustment_code();

-- Move History
CREATE OR REPLACE FUNCTION public.generate_move_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  next_num INT;
  new_code TEXT;
BEGIN
  IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
    SELECT COALESCE(MAX(
      CASE WHEN short_code ~ '^MOV-\d+$'
      THEN CAST(SUBSTRING(short_code FROM 5) AS INT)
      ELSE 0 END
    ), 0) + 1 INTO next_num FROM public.move_history;
    new_code := 'MOV-' || LPAD(next_num::TEXT, 4, '0');
    WHILE EXISTS (SELECT 1 FROM public.move_history WHERE short_code = new_code) LOOP
      next_num := next_num + 1;
      new_code := 'MOV-' || LPAD(next_num::TEXT, 4, '0');
    END LOOP;
    NEW.short_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_move_code
  BEFORE INSERT ON public.move_history
  FOR EACH ROW EXECUTE FUNCTION public.generate_move_code();

-- =============================================
-- updated_at triggers
-- =============================================
CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_transfers_updated_at
  BEFORE UPDATE ON public.transfers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Receipts
CREATE POLICY "Authenticated can view receipts"
  ON public.receipts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can manage receipts"
  ON public.receipts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('System Admin', 'Warehouse Manager', 'Warehouse Staff')
    )
  );

CREATE POLICY "Authenticated can view receipt_items"
  ON public.receipt_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can manage receipt_items"
  ON public.receipt_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('System Admin', 'Warehouse Manager', 'Warehouse Staff')
    )
  );

-- Deliveries
CREATE POLICY "Authenticated can view deliveries"
  ON public.deliveries FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can manage deliveries"
  ON public.deliveries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('System Admin', 'Warehouse Manager', 'Warehouse Staff')
    )
  );

CREATE POLICY "Authenticated can view delivery_items"
  ON public.delivery_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can manage delivery_items"
  ON public.delivery_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('System Admin', 'Warehouse Manager', 'Warehouse Staff')
    )
  );

-- Transfers
CREATE POLICY "Authenticated can view transfers"
  ON public.transfers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can manage transfers"
  ON public.transfers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('System Admin', 'Warehouse Manager', 'Warehouse Staff')
    )
  );

CREATE POLICY "Authenticated can view transfer_items"
  ON public.transfer_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can manage transfer_items"
  ON public.transfer_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('System Admin', 'Warehouse Manager', 'Warehouse Staff')
    )
  );

-- Adjustments
CREATE POLICY "Authenticated can view adjustments"
  ON public.adjustments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can create adjustments"
  ON public.adjustments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('System Admin', 'Warehouse Manager', 'Warehouse Staff')
    )
  );

-- Move History
CREATE POLICY "Authenticated can view move_history"
  ON public.move_history FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert move_history"
  ON public.move_history FOR INSERT
  WITH CHECK (true); -- Triggers can insert

-- =============================================
-- DASHBOARD KPIs VIEW
-- =============================================
CREATE OR REPLACE VIEW public.dashboard_kpis AS
SELECT
  (SELECT COUNT(*) FROM public.products) AS total_products,
  (SELECT COUNT(*) FROM public.products p
   LEFT JOIN (
     SELECT product_id, SUM(available) AS total_available
     FROM public.product_stock GROUP BY product_id
   ) ps ON p.id = ps.product_id
   WHERE COALESCE(ps.total_available, 0) <= p.reorder_level
   AND COALESCE(ps.total_available, 0) > 0
  ) AS low_stock_items,
  (SELECT COUNT(*) FROM public.products p
   LEFT JOIN (
     SELECT product_id, SUM(available) AS total_available
     FROM public.product_stock GROUP BY product_id
   ) ps ON p.id = ps.product_id
   WHERE COALESCE(ps.total_available, 0) = 0
  ) AS out_of_stock_items,
  (SELECT COUNT(*) FROM public.receipts WHERE status IN ('Draft', 'Waiting', 'Ready')) AS pending_receipts,
  (SELECT COUNT(*) FROM public.deliveries WHERE status IN ('Draft', 'Waiting', 'Ready')) AS pending_deliveries,
  (SELECT COUNT(*) FROM public.transfers WHERE status IN ('Scheduled', 'In Transit')) AS scheduled_transfers,
  (SELECT COUNT(*) FROM public.warehouses) AS total_warehouses,
  (SELECT COUNT(*) FROM public.locations) AS total_locations;
