-- =============================================
-- Fix Foreign Keys: Change created_by from auth.users to profiles
-- This allows proper relationship queries in Supabase
-- =============================================

-- Receipts
ALTER TABLE public.receipts 
  DROP CONSTRAINT IF EXISTS receipts_created_by_fkey,
  ADD CONSTRAINT receipts_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;

-- Deliveries
ALTER TABLE public.deliveries 
  DROP CONSTRAINT IF EXISTS deliveries_created_by_fkey,
  ADD CONSTRAINT deliveries_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;

-- Transfers
ALTER TABLE public.transfers 
  DROP CONSTRAINT IF EXISTS transfers_created_by_fkey,
  ADD CONSTRAINT transfers_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;

-- Adjustments
ALTER TABLE public.adjustments 
  DROP CONSTRAINT IF EXISTS adjustments_created_by_fkey,
  ADD CONSTRAINT adjustments_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;

-- Move History
ALTER TABLE public.move_history 
  DROP CONSTRAINT IF EXISTS move_history_created_by_fkey,
  ADD CONSTRAINT move_history_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;
