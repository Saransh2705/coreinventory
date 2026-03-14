import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProducts } from '@/lib/actions/products'
import CreateTransferForm from '@/components/transfers/CreateTransferForm'

export const dynamic = 'force-dynamic'

export default async function CreateTransferPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const canManage = profile?.role === 'System Admin' || profile?.role === 'Warehouse Manager' || profile?.role === 'Warehouse Staff'
  if (!canManage) redirect('/transfers')

  const productsResult = await getProducts()
  const products = productsResult.success ? (productsResult.data || []) : []

  // Fetch locations with warehouse names
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, warehouse_id, warehouses!locations_warehouse_id_fkey(name)')
    .order('name')

  const mappedLocations = (locations || []).map((loc: any) => ({
    id: loc.id,
    name: loc.name,
    warehouseName: loc.warehouses?.name || '',
  }))

  return (
    <CreateTransferForm
      locations={mappedLocations}
      products={products}
    />
  )
}
