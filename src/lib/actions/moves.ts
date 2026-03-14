'use server'

import { createClient } from '@/lib/supabase/server'
import { MoveHistory } from '@/types/supabase'

export interface MoveHistoryWithDetails extends MoveHistory {
  product: { name: string; short_code: string; sku: string } | null
  created_by_user: { full_name: string | null } | null
}

export async function getMoveHistory(filters?: {
  product_id?: string
  reference_type?: string
  reference_id?: string
  from?: string
  to?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('move_history')
    .select(`
      *,
      products!move_history_product_id_fkey(name, short_code, sku),
      profiles!move_history_created_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  // Apply filters if provided
  if (filters?.product_id) {
    query = query.eq('product_id', filters.product_id)
  }
  if (filters?.reference_type) {
    query = query.eq('reference_type', filters.reference_type)
  }
  if (filters?.reference_id) {
    query = query.eq('reference_id', filters.reference_id)
  }
  if (filters?.from) {
    query = query.ilike('from_location', `%${filters.from}%`)
  }
  if (filters?.to) {
    query = query.ilike('to_location', `%${filters.to}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching move history:', error)
    throw new Error('Failed to fetch move history')
  }

  return (data || []).map(move => ({
    ...move,
    product: move.products,
    created_by_user: move.profiles
  })) as unknown as MoveHistoryWithDetails[]
}

export async function getMoveHistoryById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('move_history')
    .select(`
      *,
      products!move_history_product_id_fkey(name, short_code, sku),
      profiles!move_history_created_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching move history record:', error)
    throw new Error('Failed to fetch move history record')
  }

  return {
    ...data,
    product: data.products,
    created_by_user: data.profiles
  } as unknown as MoveHistoryWithDetails
}

// Get move history for a specific product
export async function getProductMoveHistory(product_id: string) {
  return getMoveHistory({ product_id })
}

// Get move history for a specific operation (receipt, delivery, transfer, adjustment)
export async function getOperationMoveHistory(reference_type: string, reference_id: string) {
  return getMoveHistory({ reference_type, reference_id })
}

// Helper function to create a move history record (used internally by operations)
interface CreateMoveHistoryData {
  product_id: string
  from_location: string
  to_location: string
  quantity: number
  reference_type: string
  reference_id: string
}

export async function createMoveHistory(data: CreateMoveHistoryData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('move_history')
    .insert({
      product_id: data.product_id,
      from_location: data.from_location,
      to_location: data.to_location,
      quantity: data.quantity,
      reference_type: data.reference_type,
      reference_id: data.reference_id,
      created_by: user?.id
    })

  if (error) {
    console.error('Error creating move history:', error)
    throw new Error('Failed to create move history record')
  }
}
