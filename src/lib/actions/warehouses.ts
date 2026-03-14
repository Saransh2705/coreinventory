'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, hasRole } from '@/lib/actions/auth'

export async function getWarehouses() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching warehouses:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error in getWarehouses:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function createWarehouse(name: string, address?: string) {
  try {
    const isAdmin = await hasRole('System Admin')
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Only System Admins can create warehouses' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('warehouses')
      .insert({ name, short_code: '', address: address || null })
      .select()
      .single()

    if (error) {
      console.error('Error creating warehouse:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error in createWarehouse:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function deleteWarehouse(id: string) {
  try {
    const isAdmin = await hasRole('System Admin')
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Only System Admins can delete warehouses' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting warehouse:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteWarehouse:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}
