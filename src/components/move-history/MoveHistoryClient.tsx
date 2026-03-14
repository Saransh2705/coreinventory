'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DataTable from '@/components/shared/DataTable'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MoveHistoryWithDetails } from '@/lib/actions/moves'
import { Search, ArrowRight } from 'lucide-react'

interface MoveHistoryClientProps {
  initialMoves: MoveHistoryWithDetails[]
}

export default function MoveHistoryClient({ initialMoves }: MoveHistoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter move history
  const filteredMoves = initialMoves.filter(move => {
    const matchesSearch = 
      move.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.from_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.to_location.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">Move History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track all inventory movement records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by product, location, or move ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { 
            key: 'short_code', 
            label: 'Move ID',
            render: (move) => (
              <span className="font-mono font-medium text-sm">{move.short_code}</span>
            )
          },
          { 
            key: 'product', 
            label: 'Product',
            render: (move) => (
              <div>
                <div className="font-medium">{move.product?.name || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">
                  {move.product?.sku}
                </div>
              </div>
            )
          },
          { 
            key: 'from_location', 
            label: 'From',
            render: (move) => (
              <span className="text-sm">{move.from_location}</span>
            )
          },
          { 
            key: 'arrow', 
            label: '',
            render: () => (
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            )
          },
          { 
            key: 'to_location', 
            label: 'To',
            render: (move) => (
              <span className="text-sm">{move.to_location}</span>
            )
          },
          { 
            key: 'quantity', 
            label: 'Quantity',
            align: 'right',
            render: (move) => (
              <span className="font-medium">{move.quantity}</span>
            )
          },
          { 
            key: 'reference_type', 
            label: 'Type',
            render: (move) => {
              const typeColors: Record<string, string> = {
                receipt: 'default',
                delivery: 'secondary',
                transfer: 'outline',
                adjustment: 'destructive',
              }
              return (
                <Badge variant={typeColors[move.reference_type] as any || 'default'}>
                  {move.reference_type}
                </Badge>
              )
            }
          },
          { 
            key: 'created_by_user', 
            label: 'By',
            render: (move) => (
              <span className="text-sm">{move.created_by_user?.full_name || 'System'}</span>
            )
          },
          { 
            key: 'created_at', 
            label: 'Date',
            render: (move) => (
              <div>
                <div className="text-sm">{new Date(move.created_at).toLocaleDateString()}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(move.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
          },
        ]}
        data={filteredMoves}
        pageSize={15}
      />
    </DashboardLayout>
  )
}
