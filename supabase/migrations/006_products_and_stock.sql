-- =============================================
-- Products table + Product Stock table
-- Auto-generated short_code (PRD-001) and SKU (SKU-0001)
-- =============================================

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT 'pcs',
  reorder_level INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE INDEX products_short_code_idx ON public.products(short_code);
CREATE INDEX products_sku_idx ON public.products(sku);
CREATE INDEX products_category_idx ON public.products(category);

-- Product Stock (where the product physically is)
CREATE TABLE public.product_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  available INTEGER NOT NULL DEFAULT 0 CHECK (available >= 0),
  reserved INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id, location_id)
);

ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;
CREATE INDEX product_stock_product_idx ON public.product_stock(product_id);
CREATE INDEX product_stock_warehouse_idx ON public.product_stock(warehouse_id);
CREATE INDEX product_stock_location_idx ON public.product_stock(location_id);

-- =============================================
-- RLS Policies
-- =============================================

-- Products: all authenticated can view, admin can manage
CREATE POLICY "Authenticated users can view products"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System Admin can insert products"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'System Admin'
    )
  );

CREATE POLICY "System Admin can update products"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'System Admin'
    )
  );

CREATE POLICY "System Admin can delete products"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'System Admin'
    )
  );

-- Product Stock: all authenticated can view, admin + manager can manage
CREATE POLICY "Authenticated users can view product stock"
  ON public.product_stock FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and Manager can insert product stock"
  ON public.product_stock FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('System Admin', 'Warehouse Manager')
    )
  );

CREATE POLICY "Admin and Manager can update product stock"
  ON public.product_stock FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('System Admin', 'Warehouse Manager')
    )
  );

CREATE POLICY "System Admin can delete product stock"
  ON public.product_stock FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'System Admin'
    )
  );

-- =============================================
-- Auto-generate short_code (PRD-001, PRD-002, ...)
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_product_short_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num INT;
  new_code TEXT;
BEGIN
  IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
    SELECT COALESCE(MAX(
      CASE
        WHEN short_code ~ '^PRD-\d+$'
        THEN CAST(SUBSTRING(short_code FROM 5) AS INT)
        ELSE 0
      END
    ), 0) + 1 INTO next_num
    FROM public.products;

    new_code := 'PRD-' || LPAD(next_num::TEXT, 3, '0');

    WHILE EXISTS (SELECT 1 FROM public.products WHERE short_code = new_code) LOOP
      next_num := next_num + 1;
      new_code := 'PRD-' || LPAD(next_num::TEXT, 3, '0');
    END LOOP;

    NEW.short_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_product_code
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.generate_product_short_code();

-- =============================================
-- Auto-generate SKU (SKU-0001, SKU-0002, ...)
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_product_sku()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num INT;
  new_sku TEXT;
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    SELECT COALESCE(MAX(
      CASE
        WHEN sku ~ '^SKU-\d+$'
        THEN CAST(SUBSTRING(sku FROM 5) AS INT)
        ELSE 0
      END
    ), 0) + 1 INTO next_num
    FROM public.products;

    new_sku := 'SKU-' || LPAD(next_num::TEXT, 4, '0');

    WHILE EXISTS (SELECT 1 FROM public.products WHERE sku = new_sku) LOOP
      next_num := next_num + 1;
      new_sku := 'SKU-' || LPAD(next_num::TEXT, 4, '0');
    END LOOP;

    NEW.sku := new_sku;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_product_sku
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.generate_product_sku();

-- =============================================
-- updated_at triggers
-- =============================================
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_product_stock_updated_at
  BEFORE UPDATE ON public.product_stock
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
