'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Delivery, DeliveryItem, DeliveryStatus } from '@/types/supabase'

export interface DeliveryWithItems extends Delivery {
  warehouse: { name: string; short_code: string } | null
  items: Array<DeliveryItem & {
    product: { name: string; short_code: string; sku: string } | null
    location: { name: string } | null
  }>
  created_by_user: { full_name: string | null } | null
}

export async function getDeliveries() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deliveries')
    .select(`
      *,
      warehouses!deliveries_warehouse_id_fkey(name, short_code),
      profiles!deliveries_created_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching deliveries:', error)
    throw new Error('Failed to fetch deliveries')
  }

  return (data || []).map(delivery => ({
    ...delivery,
    warehouse: delivery.warehouses,
    created_by_user: delivery.profiles,
    items: []
  })) as unknown as DeliveryWithItems[]
}

export async function getDelivery(id: string) {
  const supabase = await createClient()

  const { data: delivery, error: deliveryError } = await supabase
    .from('deliveries')
    .select(`
      *,
      warehouses!deliveries_warehouse_id_fkey(name, short_code, id),
      profiles!deliveries_created_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (deliveryError) {
    console.error('Error fetching delivery:', deliveryError)
    throw new Error('Failed to fetch delivery')
  }

  const { data: items, error: itemsError } = await supabase
    .from('delivery_items')
    .select(`
      *,
      products!delivery_items_product_id_fkey(name, short_code, sku),
      locations!delivery_items_location_id_fkey(name)
    `)
    .eq('delivery_id', id)

  if (itemsError) {
    console.error('Error fetching delivery items:', itemsError)
    throw new Error('Failed to fetch delivery items')
  }

  return {
    ...delivery,
    warehouse: delivery.warehouses,
    created_by_user: delivery.profiles,
    items: (items || []).map(item => ({
      ...item,
      product: item.products,
      location: item.locations
    }))
  } as unknown as DeliveryWithItems
}

interface CreateDeliveryData {
  customer_name: string
  warehouse_id: string
  status?: DeliveryStatus
  notes?: string
  delivery_date?: string
  items: Array<{
    product_id: string
    location_id?: string
    quantity: number
  }>
}

export async function createDelivery(data: CreateDeliveryData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Create delivery
  const { data: delivery, error: deliveryError } = await supabase
    .from('deliveries')
    .insert({
      customer_name: data.customer_name,
      warehouse_id: data.warehouse_id,
      status: data.status || 'Draft',
      notes: data.notes,
      delivery_date: data.delivery_date,
      created_by: user.id
    })
    .select()
    .single()

  if (deliveryError) {
    console.error('Error creating delivery:', deliveryError)
    throw new Error('Failed to create delivery')
  }

  // Create delivery items
  if (data.items && data.items.length > 0) {
    const deliveryItems = data.items.map(item => ({
      delivery_id: delivery.id,
      product_id: item.product_id,
      location_id: item.location_id,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('delivery_items')
      .insert(deliveryItems)

    if (itemsError) {
      console.error('Error creating delivery items:', itemsError)
      // Rollback: delete the delivery
      await supabase.from('deliveries').delete().eq('id', delivery.id)
      throw new Error('Failed to create delivery items')
    }
  }

  revalidatePath('/deliveries')
  return delivery
}

export async function updateDeliveryStatus(id: string, status: DeliveryStatus) {
  const supabase = await createClient()

  const updateData: { status: DeliveryStatus; delivery_date?: string } = { status }
  
  // If status is Done, set delivery_date to now if not already set
  if (status === 'Done') {
    const { data: delivery } = await supabase
      .from('deliveries')
      .select('delivery_date')
      .eq('id', id)
      .single()
    
    if (delivery && !delivery.delivery_date) {
      updateData.delivery_date = new Date().toISOString()
    }
  }

  const { error } = await supabase
    .from('deliveries')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating delivery status:', error)
    throw new Error('Failed to update delivery status')
  }

  revalidatePath('/deliveries')
  revalidatePath(`/deliveries/${id}`)
}

export async function deleteDelivery(id: string) {
  const supabase = await createClient()

  // Delete delivery items first (cascade should handle this, but being explicit)
  await supabase.from('delivery_items').delete().eq('delivery_id', id)

  // Delete delivery
  const { error } = await supabase
    .from('deliveries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting delivery:', error)
    throw new Error('Failed to delete delivery')
  }

  revalidatePath('/deliveries')
}

export async function addDeliveryItem(
  delivery_id: string,
  product_id: string,
  quantity: number,
  location_id?: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('delivery_items')
    .insert({
      delivery_id,
      product_id,
      quantity,
      location_id
    })

  if (error) {
    console.error('Error adding delivery item:', error)
    throw new Error('Failed to add delivery item')
  }

  revalidatePath('/deliveries')
  revalidatePath(`/deliveries/${delivery_id}`)
}

export async function deleteDeliveryItem(id: string, delivery_id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('delivery_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting delivery item:', error)
    throw new Error('Failed to delete delivery item')
  }

  revalidatePath('/deliveries')
  revalidatePath(`/deliveries/${delivery_id}`)
}
