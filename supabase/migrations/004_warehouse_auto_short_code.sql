-- Auto-generate short_code for warehouses (e.g. WH-001, WH-002, ...)

CREATE OR REPLACE FUNCTION public.generate_warehouse_short_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num INT;
  new_code TEXT;
BEGIN
  -- Only generate if short_code is not provided or empty
  IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
    SELECT COALESCE(MAX(
      CASE
        WHEN short_code ~ '^WH-\d+$'
        THEN CAST(SUBSTRING(short_code FROM 4) AS INT)
        ELSE 0
      END
    ), 0) + 1 INTO next_num
    FROM public.warehouses;

    new_code := 'WH-' || LPAD(next_num::TEXT, 3, '0');

    -- Handle unlikely collision
    WHILE EXISTS (SELECT 1 FROM public.warehouses WHERE short_code = new_code) LOOP
      next_num := next_num + 1;
      new_code := 'WH-' || LPAD(next_num::TEXT, 3, '0');
    END LOOP;

    NEW.short_code := new_code;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_warehouse_code
  BEFORE INSERT ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.generate_warehouse_short_code();
