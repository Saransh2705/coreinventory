'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Adjustment } from '@/types/supabase'

export interface AdjustmentWithDetails extends Adjustment {
  product: { name: string; short_code: string; sku: string } | null
  warehouse: { name: string; short_code: string } | null
  location: { name: string } | null
  created_by_user: { full_name: string | null } | null
}

export async function getAdjustments() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('adjustments')
    .select(`
      *,
      products!adjustments_product_id_fkey(name, short_code, sku),
      warehouses!adjustments_warehouse_id_fkey(name, short_code),
      locations!adjustments_location_id_fkey(name),
      profiles!adjustments_created_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching adjustments:', error)
    throw new Error('Failed to fetch adjustments')
  }

  return (data || []).map(adjustment => ({
    ...adjustment,
    product: adjustment.products,
    warehouse: adjustment.warehouses,
    location: adjustment.locations,
    created_by_user: adjustment.profiles
  })) as unknown as AdjustmentWithDetails[]
}

export async function getAdjustment(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('adjustments')
    .select(`
      *,
      products!adjustments_product_id_fkey(name, short_code, sku),
      warehouses!adjustments_warehouse_id_fkey(name, short_code, id),
      locations!adjustments_location_id_fkey(name, id),
      profiles!adjustments_created_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching adjustment:', error)
    throw new Error('Failed to fetch adjustment')
  }

  return {
    ...data,
    product: data.products,
    warehouse: data.warehouses,
    location: data.locations,
    created_by_user: data.profiles
  } as unknown as AdjustmentWithDetails
}

interface CreateAdjustmentData {
  product_id: string
  warehouse_id: string
  location_id?: string
  before_quantity: number
  after_quantity: number
  reason: string
}

export async function createAdjustment(data: CreateAdjustmentData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Calculate difference
  const difference = data.after_quantity - data.before_quantity

  // Create adjustment
  const { data: adjustment, error } = await supabase
    .from('adjustments')
    .insert({
      product_id: data.product_id,
      warehouse_id: data.warehouse_id,
      location_id: data.location_id,
      before_quantity: data.before_quantity,
      after_quantity: data.after_quantity,
      difference,
      reason: data.reason,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating adjustment:', error)
    throw new Error('Failed to create adjustment')
  }

  revalidatePath('/adjustments')
  return adjustment
}

export async function deleteAdjustment(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('adjustments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting adjustment:', error)
    throw new Error('Failed to delete adjustment')
  }

  revalidatePath('/adjustments')
}

// Helper function to get current stock for a product at a location
export async function getProductStock(
  product_id: string,
  warehouse_id: string,
  location_id?: string
) {
  const supabase = await createClient()

  let query = supabase
    .from('product_stock')
    .select('quantity')
    .eq('product_id', product_id)
    .eq('warehouse_id', warehouse_id)

  if (location_id) {
    query = query.eq('location_id', location_id)
  } else {
    query = query.is('location_id', null)
  }

  const { data, error } = await query.single()

  if (error) {
    // If no stock record exists, return 0
    if (error.code === 'PGRST116') {
      return 0
    }
    console.error('Error fetching product stock:', error)
    throw new Error('Failed to fetch product stock')
  }

  return (data as { quantity?: number } | null)?.quantity || 0
}
