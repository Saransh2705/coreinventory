import { getAdjustments } from '@/lib/actions/adjustments'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdjustmentsClient from '@/components/adjustments/AdjustmentsClient'

export const dynamic = 'force-dynamic'

export default async function AdjustmentsPage() {
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

  // Fetch adjustments
  const adjustments = await getAdjustments()

  return (
    <AdjustmentsClient 
      initialAdjustments={adjustments}
      userRole={profile?.role || 'Viewer'}
    />
  )
}
