'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Receipt, ReceiptItem, ReceiptStatus } from '@/types/supabase'

export interface ReceiptWithItems extends Receipt {
  warehouse: { name: string; short_code: string } | null
  items: Array<ReceiptItem & {
    product: { name: string; short_code: string; sku: string } | null
    location: { name: string } | null
  }>
  created_by_user: { full_name: string | null } | null
}

export async function getReceipts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('receipts')
    .select(`
      *,
      warehouses!receipts_warehouse_id_fkey(name, short_code),
      profiles!receipts_created_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching receipts:', error)
    throw new Error('Failed to fetch receipts')
  }

  return (data || []).map(receipt => ({
    ...receipt,
    warehouse: receipt.warehouses,
    created_by_user: receipt.profiles,
    items: []
  })) as unknown as ReceiptWithItems[]
}

export async function getReceipt(id: string) {
  const supabase = await createClient()

  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .select(`
      *,
      warehouses!receipts_warehouse_id_fkey(name, short_code, id),
      profiles!receipts_created_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (receiptError) {
    console.error('Error fetching receipt:', receiptError)
    throw new Error('Failed to fetch receipt')
  }

  const { data: items, error: itemsError } = await supabase
    .from('receipt_items')
    .select(`
      *,
      products!receipt_items_product_id_fkey(name, short_code, sku),
      locations!receipt_items_location_id_fkey(name)
    `)
    .eq('receipt_id', id)

  if (itemsError) {
    console.error('Error fetching receipt items:', itemsError)
    throw new Error('Failed to fetch receipt items')
  }

  return {
    ...receipt,
    warehouse: receipt.warehouses,
    created_by_user: receipt.profiles,
    items: (items || []).map(item => ({
      ...item,
      product: item.products,
      location: item.locations
    }))
  } as unknown as ReceiptWithItems
}

interface CreateReceiptData {
  supplier_name: string
  warehouse_id: string
  status?: ReceiptStatus
  notes?: string
  received_date?: string
  items: Array<{
    product_id: string
    location_id?: string
    quantity: number
  }>
}

export async function createReceipt(data: CreateReceiptData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Create receipt
  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .insert({
      supplier_name: data.supplier_name,
      warehouse_id: data.warehouse_id,
      status: data.status || 'Draft',
      notes: data.notes,
      received_date: data.received_date,
      created_by: user.id
    })
    .select()
    .single()

  if (receiptError) {
    console.error('Error creating receipt:', receiptError)
    throw new Error('Failed to create receipt')
  }

  // Create receipt items
  if (data.items && data.items.length > 0) {
    const receiptItems = data.items.map(item => ({
      receipt_id: receipt.id,
      product_id: item.product_id,
      location_id: item.location_id,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('receipt_items')
      .insert(receiptItems)

    if (itemsError) {
      console.error('Error creating receipt items:', itemsError)
      // Rollback: delete the receipt
      await supabase.from('receipts').delete().eq('id', receipt.id)
      throw new Error('Failed to create receipt items')
    }
  }

  revalidatePath('/receipts')
  return receipt
}

export async function updateReceiptStatus(id: string, status: ReceiptStatus) {
  const supabase = await createClient()

  const updateData: { status: ReceiptStatus; received_date?: string } = { status }
  
  // If status is Done, set received_date to now if not already set
  if (status === 'Done') {
    const { data: receipt } = await supabase
      .from('receipts')
      .select('received_date')
      .eq('id', id)
      .single()
    
    if (receipt && !receipt.received_date) {
      updateData.received_date = new Date().toISOString()
    }
  }

  const { error } = await supabase
    .from('receipts')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating receipt status:', error)
    throw new Error('Failed to update receipt status')
  }

  revalidatePath('/receipts')
  revalidatePath(`/receipts/${id}`)
}

export async function deleteReceipt(id: string) {
  const supabase = await createClient()

  // Delete receipt items first (cascade should handle this, but being explicit)
  await supabase.from('receipt_items').delete().eq('receipt_id', id)

  // Delete receipt
  const { error } = await supabase
    .from('receipts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting receipt:', error)
    throw new Error('Failed to delete receipt')
  }

  revalidatePath('/receipts')
}

export async function addReceiptItem(
  receipt_id: string,
  product_id: string,
  quantity: number,
  location_id?: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('receipt_items')
    .insert({
      receipt_id,
      product_id,
      quantity,
      location_id
    })

  if (error) {
    console.error('Error adding receipt item:', error)
    throw new Error('Failed to add receipt item')
  }

  revalidatePath('/receipts')
  revalidatePath(`/receipts/${receipt_id}`)
}

export async function deleteReceiptItem(id: string, receipt_id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('receipt_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting receipt item:', error)
    throw new Error('Failed to delete receipt item')
  }

  revalidatePath('/receipts')
  revalidatePath(`/receipts/${receipt_id}`)
}
