'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
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
  TransferWithItems 
} from '@/lib/actions/transfers'
import { updateTransferStatus, deleteTransfer } from '@/lib/actions/transfers'
import { FileText, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { getStatusVariant } from '@/components/shared/DataTable'
import { TransferStatus, UserRole } from '@/types/supabase'

interface TransfersClientProps {
  initialTransfers: TransferWithItems[]
  userRole: UserRole
}

export default function TransfersClient({ initialTransfers, userRole }: TransfersClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTransfer, setSelectedTransfer] = useState<TransferWithItems | null>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<TransferStatus>('Scheduled')
  const [isUpdating, setIsUpdating] = useState(false)

  // Filter transfers
  const filteredTransfers = initialTransfers.filter(transfer => {
    const matchesSearch = 
      transfer.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.from_location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.to_location?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async () => {
    if (!selectedTransfer) return
    setIsUpdating(true)
    
    try {
      await updateTransferStatus(selectedTransfer.id, newStatus)
      toast.success('Transfer status updated successfully')
      setShowStatusDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Failed to update transfer status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string, shortCode: string) => {
    if (!confirm(`Delete transfer ${shortCode}? This action cannot be undone.`)) return

    try {
      await deleteTransfer(id)
      toast.success('Transfer deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete transfer')
    }
  }

  const canManage = userRole === 'System Admin' || userRole === 'Warehouse Manager' || userRole === 'Warehouse Staff'

  return (
    <DashboardLayout>
      <PageHeader
        title="Internal Transfers"
        subtitle="Move stock between locations"
        action={canManage ? 'Create Transfer' : undefined}
        onAction={() => router.push('/transfers/create')}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search transfers..."
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
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          { 
            key: 'short_code', 
            label: 'Transfer ID',
            render: (transfer) => (
              <span className="font-mono font-medium">{transfer.short_code}</span>
            )
          },
          { 
            key: 'from_location', 
            label: 'From Location',
            render: (transfer) => (
              <div>
                <div className="font-medium">{transfer.from_location?.name || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">
                  {transfer.from_location?.warehouse?.name}
                </div>
              </div>
            )
          },
          { 
            key: 'to_location', 
            label: 'To Location',
            render: (transfer) => (
              <div>
                <div className="font-medium">{transfer.to_location?.name || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">
                  {transfer.to_location?.warehouse?.name}
                </div>
              </div>
            )
          },
          { 
            key: 'scheduled_date', 
            label: 'Scheduled',
            render: (transfer) => transfer.scheduled_date 
              ? new Date(transfer.scheduled_date).toLocaleDateString() 
              : 'Not scheduled'
          },
          { 
            key: 'status', 
            label: 'Status',
            render: (transfer) => (
              <Badge variant={getStatusVariant(transfer.status)}>
                {transfer.status}
              </Badge>
            )
          },
          { 
            key: 'created_at', 
            label: 'Created',
            render: (transfer) => new Date(transfer.created_at).toLocaleDateString()
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (transfer) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/transfers/${transfer.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canManage && transfer.status !== 'Done' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTransfer(transfer)
                      setNewStatus(transfer.status)
                      setShowStatusDialog(true)
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
                {canManage && transfer.status === 'Scheduled' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(transfer.id, transfer.short_code)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            )
          }
        ]}
        data={filteredTransfers}
        pageSize={10}
      />

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Transfer Status</DialogTitle>
            <DialogDescription>
              Change the status of transfer {selectedTransfer?.short_code}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as TransferStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
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
    </DashboardLayout>
  )
}
