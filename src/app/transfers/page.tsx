import { getTransfers } from '@/lib/actions/transfers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TransfersClient from '@/components/transfers/TransfersClient'

export const dynamic = 'force-dynamic'

export default async function TransfersPage() {
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

  // Fetch transfers
  const transfers = await getTransfers()

  return (
    <TransfersClient 
      initialTransfers={transfers}
      userRole={profile?.role || 'Viewer'}
    />
  )
}
