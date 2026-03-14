import { getReceipts } from '@/lib/actions/receipts'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReceiptsClient from '@/components/receipts/ReceiptsClient'

export const dynamic = 'force-dynamic'

export default async function ReceiptsPage() {
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

  // Fetch receipts
  const receipts = await getReceipts()

  return (
    <ReceiptsClient 
      initialReceipts={receipts}
      userRole={profile?.role || 'Viewer'}
    />
  )
}
