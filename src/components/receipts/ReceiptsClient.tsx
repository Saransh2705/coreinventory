'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import DataTable from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ReceiptWithItems 
} from '@/lib/actions/receipts'
import { updateReceiptStatus, deleteReceipt } from '@/lib/actions/receipts'
import { FileText, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { getStatusVariant } from '@/components/shared/DataTable'
import { ReceiptStatus, UserRole } from '@/types/supabase'

interface ReceiptsClientProps {
  initialReceipts: ReceiptWithItems[]
  userRole: UserRole
}

export default function ReceiptsClient({ initialReceipts, userRole }: ReceiptsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptWithItems | null>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<ReceiptStatus>('Draft')
  const [isUpdating, setIsUpdating] = useState(false)

  // Filter receipts
  const filteredReceipts = initialReceipts.filter(receipt => {
    const matchesSearch = 
      receipt.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.warehouse?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async () => {
    if (!selectedReceipt) return
    setIsUpdating(true) 
    
    try {
      await updateReceiptStatus(selectedReceipt.id, newStatus)
      toast.success('Receipt status updated successfully')
      setShowStatusDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Failed to update receipt status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string, shortCode: string) => {
    if (!confirm(`Delete receipt ${shortCode}? This action cannot be undone.`)) return

    try {
      await deleteReceipt(id)
      toast.success('Receipt deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete receipt')
    }
  }

  const canManage = userRole === 'System Admin' || userRole === 'Warehouse Manager' || userRole === 'Warehouse Staff'

  return (
    <>
      <PageHeader
        title="Receipts"
        subtitle="Manage incoming stock from suppliers"
        action={canManage ? 'Create Receipt' : undefined}
        onAction={() => router.push('/receipts/create')}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Waiting">Waiting</SelectItem>
            <SelectItem value="Ready">Ready</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          { 
            key: 'short_code', 
            label: 'Receipt ID',
            render: (receipt) => (
              <span className="font-mono font-medium">{receipt.short_code}</span>
            )
          },
          { 
            key: 'supplier_name', 
            label: 'Supplier',
            render: (receipt) => (
              <span className="font-medium text-foreground">{receipt.supplier_name}</span>
            )
          },
          { 
            key: 'warehouse', 
            label: 'Warehouse',
            render: (receipt) => receipt.warehouse?.name || 'N/A'
          },
          { 
            key: 'received_date', 
            label: 'Received Date',
            render: (receipt) => receipt.received_date 
              ? new Date(receipt.received_date).toLocaleDateString() 
              : 'Not received'
          },
          { 
            key: 'status', 
            label: 'Status',
            render: (receipt) => (
              <Badge variant={getStatusVariant(receipt.status)}>
                {receipt.status}
              </Badge>
            )
          },
          { 
            key: 'created_at', 
            label: 'Created',
            render: (receipt) => new Date(receipt.created_at).toLocaleDateString()
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (receipt) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/receipts/${receipt.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canManage && receipt.status !== 'Done' && receipt.status !== 'Cancelled' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedReceipt(receipt)
                      setNewStatus(receipt.status)
                      setShowStatusDialog(true)
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
                {canManage && receipt.status === 'Draft' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(receipt.id, receipt.short_code)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            )
          }
        ]}
        data={filteredReceipts}
        pageSize={10}
      />

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Receipt Status</DialogTitle>
            <DialogDescription>
              Change the status of receipt {selectedReceipt?.short_code}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as ReceiptStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Waiting">Waiting</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
