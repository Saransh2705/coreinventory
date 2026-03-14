import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWarehouses } from '@/lib/actions/warehouses'
import { getProducts } from '@/lib/actions/products'
import CreateAdjustmentForm from '@/components/adjustments/CreateAdjustmentForm'

export const dynamic = 'force-dynamic'

export default async function CreateAdjustmentPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const canManage = profile?.role === 'System Admin' || profile?.role === 'Warehouse Manager' || profile?.role === 'Warehouse Staff'
  if (!canManage) redirect('/adjustments')

  const warehousesResult = await getWarehouses()
  const productsResult = await getProducts()

  const warehouses = warehousesResult.success ? (warehousesResult.data || []) : []
  const products = productsResult.success ? (productsResult.data || []) : []

  return (
    <CreateAdjustmentForm
      warehouses={warehouses}
      products={products}
    />
  )
}
