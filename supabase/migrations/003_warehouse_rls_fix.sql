-- Fix RLS: Separate SELECT from write operations for warehouses
-- The FOR ALL policy allows all operations for System Admin,
-- but we need to ensure non-admins cannot insert/update/delete.

-- Drop existing write policy (FOR ALL covers writes too)
DROP POLICY IF EXISTS "System Admin can manage warehouses" ON public.warehouses;

-- Recreate as separate policies for clarity
CREATE POLICY "System Admin can insert warehouses"
  ON public.warehouses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'System Admin'
    )
  );

CREATE POLICY "System Admin can update warehouses"
  ON public.warehouses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'System Admin'
    )
  );

CREATE POLICY "System Admin can delete warehouses"
  ON public.warehouses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'System Admin'
    )
  );
