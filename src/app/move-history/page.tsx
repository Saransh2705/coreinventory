import { getMoveHistory } from '@/lib/actions/moves'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MoveHistoryClient from '@/components/move-history/MoveHistoryClient'

export const dynamic = 'force-dynamic'

export default async function MoveHistoryPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch move history
  const moves = await getMoveHistory()

  return <MoveHistoryClient initialMoves={moves} />
}
