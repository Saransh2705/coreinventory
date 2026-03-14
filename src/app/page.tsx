import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { DashboardKPIs } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch dashboard KPIs from view
  const { data: kpis, error } = await supabase
    .from('dashboard_kpis')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching dashboard KPIs:', error)
  }

  // Fetch recent receipts (last 5)
  const { data: recentReceipts } = await supabase
    .from('receipts')
    .select(`
      *,
      warehouse:warehouses(name, short_code)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent deliveries (last 5)
  const { data: recentDeliveries } = await supabase
    .from('deliveries')
    .select(`
      *,
      warehouse:warehouses(name, short_code)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent transfers (last 5)
  const { data: recentTransfers } = await supabase
    .from('transfers')
    .select(`
      *,
      from_location:locations!transfers_from_location_id_fkey(name),
      to_location:locations!transfers_to_location_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <DashboardClient
      kpis={kpis || {
        total_products: 0,
        low_stock_items: 0,
        out_of_stock_items: 0,
        pending_receipts: 0,
        pending_deliveries: 0,
        scheduled_transfers: 0,
        total_warehouses: 0,
        total_locations: 0,
      }}
      recentReceipts={recentReceipts || []}
      recentDeliveries={recentDeliveries || []}
      recentTransfers={recentTransfers || []}
    />
  )
}
