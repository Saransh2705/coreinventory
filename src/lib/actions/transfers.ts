'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Transfer, TransferItem, TransferStatus } from '@/types/supabase'

export interface TransferWithItems extends Transfer {
  from_location: { 
    name: string
    warehouse: { name: string; short_code: string } | null
  } | null
  to_location: {
    name: string
    warehouse: { name: string; short_code: string } | null
  } | null
  items: Array<TransferItem & {
    product: { name: string; short_code: string; sku: string } | null
  }>
  created_by_user: { full_name: string | null } | null
}

export async function getTransfers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transfers')
    .select(`
      *,
      from_locations:locations!transfers_from_location_id_fkey(
        name,
        warehouses(name, short_code)
      ),
      to_locations:locations!transfers_to_location_id_fkey(
        name,
        warehouses(name, short_code)
      ),
      profiles!transfers_created_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transfers:', error)
    throw new Error('Failed to fetch transfers')
  }

  return (data || []).map(transfer => {
    const fromLoc = transfer.from_locations as any
    const toLoc = transfer.to_locations as any
    const profile = transfer.profiles as any
    
    return {
      ...transfer,
      from_location: fromLoc ? {
        name: fromLoc.name,
        warehouse: fromLoc.warehouses
      } : null,
      to_location: toLoc ? {
        name: toLoc.name,
        warehouse: toLoc.warehouses
      } : null,
      created_by_user: profile,
      items: []
    }
  }) as unknown as TransferWithItems[]
}

export async function getTransfer(id: string) {
  const supabase = await createClient()

  const { data: transfer, error: transferError } = await supabase
    .from('transfers')
    .select(`
      *,
      from_locations:locations!transfers_from_location_id_fkey(
        id,
        name,
        warehouses(name, short_code)
      ),
      to_locations:locations!transfers_to_location_id_fkey(
        id,
        name,
        warehouses(name, short_code)
      ),
      profiles!transfers_created_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (transferError) {
    console.error('Error fetching transfer:', transferError)
    throw new Error('Failed to fetch transfer')
  }

  const { data: items, error: itemsError } = await supabase
    .from('transfer_items')
    .select(`
      *,
      products!transfer_items_product_id_fkey(name, short_code, sku)
    `)
    .eq('transfer_id', id)

  if (itemsError) {
    console.error('Error fetching transfer items:', itemsError)
    throw new Error('Failed to fetch transfer items')
  }

  const fromLoc = transfer.from_locations as any
  const toLoc = transfer.to_locations as any
  const profile = transfer.profiles as any
  const itemsData = items || []
  
  return {
    ...transfer,
    from_location: fromLoc ? {
      name: fromLoc.name,
      warehouse: fromLoc.warehouses
    } : null,
    to_location: toLoc ? {
      name: toLoc.name,
      warehouse: toLoc.warehouses
    } : null,
    created_by_user: profile,
    items: itemsData.map((item: any) => ({
      ...item,
      product: item.products
    }))
  } as unknown as TransferWithItems
}

interface CreateTransferData {
  from_location_id: string
  to_location_id: string
  status?: TransferStatus
  notes?: string
  scheduled_date?: string
  items: Array<{
    product_id: string
    quantity: number
  }>
}

export async function createTransfer(data: CreateTransferData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Validate that from and to locations are different
  if (data.from_location_id === data.to_location_id) {
    throw new Error('Source and destination locations must be different')
  }

  // Create transfer
  const { data: transfer, error: transferError } = await supabase
    .from('transfers')
    .insert({
      from_location_id: data.from_location_id,
      to_location_id: data.to_location_id,
      status: data.status || 'Scheduled',
      notes: data.notes,
      scheduled_date: data.scheduled_date,
      created_by: user.id
    })
    .select()
    .single()

  if (transferError) {
    console.error('Error creating transfer:', transferError)
    throw new Error('Failed to create transfer')
  }

  // Create transfer items
  if (data.items && data.items.length > 0) {
    const transferItems = data.items.map(item => ({
      transfer_id: transfer.id,
      product_id: item.product_id,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('transfer_items')
      .insert(transferItems)

    if (itemsError) {
      console.error('Error creating transfer items:', itemsError)
      // Rollback: delete the transfer
      await supabase.from('transfers').delete().eq('id', transfer.id)
      throw new Error('Failed to create transfer items')
    }
  }

  revalidatePath('/transfers')
  return transfer
}

export async function updateTransferStatus(id: string, status: TransferStatus) {
  const supabase = await createClient()

  const updateData: { status: TransferStatus; completed_date?: string } = { status }
  
  // If status is Done, set completed_date to now if not already set
  if (status === 'Done') {
    const { data: transfer } = await supabase
      .from('transfers')
      .select('completed_date')
      .eq('id', id)
      .single()
    
    if (transfer && !transfer.completed_date) {
      updateData.completed_date = new Date().toISOString()
    }
  }

  const { error } = await supabase
    .from('transfers')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating transfer status:', error)
    throw new Error('Failed to update transfer status')
  }

  revalidatePath('/transfers')
  revalidatePath(`/transfers/${id}`)
}

export async function deleteTransfer(id: string) {
  const supabase = await createClient()

  // Delete transfer items first (cascade should handle this, but being explicit)
  await supabase.from('transfer_items').delete().eq('transfer_id', id)

  // Delete transfer
  const { error } = await supabase
    .from('transfers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting transfer:', error)
    throw new Error('Failed to delete transfer')
  }

  revalidatePath('/transfers')
}

export async function addTransferItem(
  transfer_id: string,
  product_id: string,
  quantity: number
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transfer_items')
    .insert({
      transfer_id,
      product_id,
      quantity
    })

  if (error) {
    console.error('Error adding transfer item:', error)
    throw new Error('Failed to add transfer item')
  }

  revalidatePath('/transfers')
  revalidatePath(`/transfers/${transfer_id}`)
}

export async function deleteTransferItem(id: string, transfer_id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transfer_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting transfer item:', error)
    throw new Error('Failed to delete transfer item')
  }

  revalidatePath('/transfers')
  revalidatePath(`/transfers/${transfer_id}`)
}
