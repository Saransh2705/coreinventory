'use server'

import { createClient } from '@/lib/supabase/server'
import { hasRole } from '@/lib/actions/auth'

export async function getProducts() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return { success: false, error: error.message, data: [] }
  }

  // Fetch aggregated stock per product
  const { data: stockAgg, error: stockErr } = await supabase
    .from('product_stock')
    .select('product_id, available, reserved')

  if (stockErr) {
    console.error('Error fetching stock:', stockErr)
  }

  // Aggregate stock totals per product
  const stockMap = new Map<string, { totalAvailable: number; totalReserved: number }>()
  if (stockAgg) {
    for (const s of stockAgg) {
      const existing = stockMap.get(s.product_id) || { totalAvailable: 0, totalReserved: 0 }
      existing.totalAvailable += s.available
      existing.totalReserved += s.reserved
      stockMap.set(s.product_id, existing)
    }
  }

  const enriched = products.map((p) => {
    const stock = stockMap.get(p.id) || { totalAvailable: 0, totalReserved: 0 }
    const status =
      stock.totalAvailable === 0
        ? 'Out of Stock'
        : stock.totalAvailable <= p.reorder_level
          ? 'Low Stock'
          : 'In Stock'
    return {
      ...p,
      stock_available: stock.totalAvailable,
      stock_reserved: stock.totalReserved,
      status,
    }
  })

  return { success: true, data: enriched }
}

export async function getProduct(id: string) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: error.message }
  }

  // Get stock distribution with warehouse + location names
  const { data: stockRows, error: stockErr } = await supabase
    .from('product_stock')
    .select(`
      id,
      available,
      reserved,
      warehouse_id,
      location_id,
      warehouses ( name, short_code ),
      locations ( name, short_code )
    `)
    .eq('product_id', id)

  if (stockErr) {
    console.error('Error fetching product stock:', stockErr)
  }

  const stockDistribution = (stockRows || []).map((s: Record<string, unknown>) => {
    const wh = s.warehouses as { name: string; short_code: string } | null
    const loc = s.locations as { name: string; short_code: string } | null
    return {
      id: s.id as string,
      warehouse: wh?.short_code || '—',
      warehouseName: wh?.name || '—',
      location: loc?.short_code || '—',
      locationName: loc?.name || '—',
      available: s.available as number,
      reserved: s.reserved as number,
      free: (s.available as number) - (s.reserved as number),
    }
  })

  const totalAvailable = stockDistribution.reduce((sum, s) => sum + s.available, 0)
  const totalReserved = stockDistribution.reduce((sum, s) => sum + s.reserved, 0)
  const status =
    totalAvailable === 0
      ? 'Out of Stock'
      : totalAvailable <= product.reorder_level
        ? 'Low Stock'
        : 'In Stock'

  return {
    success: true,
    data: {
      ...product,
      stock_available: totalAvailable,
      stock_reserved: totalReserved,
      status,
      stock_distribution: stockDistribution,
    },
  }
}

export async function createProduct(data: {
  name: string
  category: string
  unit: string
  reorder_level: number
  description?: string
}) {
  const isAdmin = await hasRole('System Admin')
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Only System Admins can create products' }
  }

  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: data.name,
      short_code: '',
      sku: '',
      category: data.category,
      unit: data.unit,
      reorder_level: data.reorder_level,
      description: data.description || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: product }
}

export async function updateProduct(
  id: string,
  data: {
    name?: string
    category?: string
    unit?: string
    reorder_level?: number
    description?: string
  }
) {
  const isAdmin = await hasRole('System Admin')
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Only System Admins can update products' }
  }

  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: product }
}

export async function deleteProduct(id: string) {
  const isAdmin = await hasRole('System Admin')
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Only System Admins can delete products' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('category')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  const unique = [...new Set((data || []).map((d) => d.category).filter(Boolean))]
  return unique.sort()
}
