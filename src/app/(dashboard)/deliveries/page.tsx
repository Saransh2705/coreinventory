import { getDeliveries } from '@/lib/actions/deliveries'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DeliveriesClient from '@/components/deliveries/DeliveriesClient'

export const dynamic = 'force-dynamic'

export default async function DeliveriesPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Fetch deliveries
  const deliveries = await getDeliveries()

  return (
    <DeliveriesClient 
      initialDeliveries={deliveries}
      userRole={profile?.role || 'Viewer'}
    />
  )
}
