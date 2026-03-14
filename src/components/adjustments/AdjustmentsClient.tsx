'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdjustmentWithDetails } from '@/lib/actions/adjustments'
import { deleteAdjustment } from '@/lib/actions/adjustments'
import { Trash2, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { UserRole } from '@/types/supabase'

interface AdjustmentsClientProps {
  initialAdjustments: AdjustmentWithDetails[]
  userRole: UserRole
}

export default function AdjustmentsClient({ initialAdjustments, userRole }: AdjustmentsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter adjustments 
  const filteredAdjustments = initialAdjustments.filter(adjustment => {
    const matchesSearch = 
      adjustment.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adjustment.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adjustment.warehouse?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const handleDelete = async (id: string, shortCode: string) => {
    if (!confirm(`Delete adjustment ${shortCode}? This action cannot be undone.`)) return

    try {
      await deleteAdjustment(id)
      toast.success('Adjustment deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete adjustment')
    }
  }

  const canManage = userRole === 'System Admin' || userRole === 'Warehouse Manager' || userRole === 'Warehouse Staff'

  return (
    <DashboardLayout>
      <PageHeader
        title="Inventory Adjustments"
        subtitle="Track stock quantity corrections and adjustments"
        action={canManage ? 'New Adjustment' : undefined}
        onAction={() => router.push('/adjustments/create')}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search adjustments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { 
            key: 'short_code', 
            label: 'Adjustment ID',
            render: (adjustment) => (
              <span className="font-mono font-medium">{adjustment.short_code}</span>
            )
          },
          { 
            key: 'product', 
            label: 'Product',
            render: (adjustment) => (
              <div>
                <div className="font-medium">{adjustment.product?.name || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">
                  {adjustment.product?.sku}
                </div>
              </div>
            )
          },
          { 
            key: 'warehouse', 
            label: 'Warehouse',
            render: (adjustment) => adjustment.warehouse?.name || 'N/A'
          },
          { 
            key: 'location', 
            label: 'Location',
            render: (adjustment) => adjustment.location?.name || 'General'
          },
          { 
            key: 'before_quantity', 
            label: 'Before',
            align: 'right',
            render: (adjustment) => adjustment.before_quantity
          },
          { 
            key: 'after_quantity', 
            label: 'After',
            align: 'right',
            render: (adjustment) => adjustment.after_quantity
          },
          { 
            key: 'difference', 
            label: 'Change',
            render: (adjustment) => {
              const diff = adjustment.difference
              const isPositive = diff > 0
              const isNegative = diff < 0
              
              return (
                <div className="flex items-center gap-1">
                  {isPositive && <ArrowUp className="h-4 w-4 text-green-600" />}
                  {isNegative && <ArrowDown className="h-4 w-4 text-red-600" />}
                  {diff === 0 && <Minus className="h-4 w-4 text-gray-400" />}
                  <span className={`font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                    {isPositive && '+'}{diff}
                  </span>
                </div>
              )
            }
          },
          { 
            key: 'reason', 
            label: 'Reason',
            render: (adjustment) => (
              <span className="text-sm">{adjustment.reason}</span>
            )
          },
          { 
            key: 'created_at', 
            label: 'Date',
            render: (adjustment) => new Date(adjustment.created_at).toLocaleDateString()
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (adjustment) => (
              <div className="flex items-center gap-2">
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(adjustment.id, adjustment.short_code)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            )
          }
        ]}
        data={filteredAdjustments}
        pageSize={10}
      />
    </DashboardLayout>
  )
}
