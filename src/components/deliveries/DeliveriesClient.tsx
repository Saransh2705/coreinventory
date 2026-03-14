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
  DeliveryWithItems 
} from '@/lib/actions/deliveries'
import { updateDeliveryStatus, deleteDelivery } from '@/lib/actions/deliveries'
import { FileText, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { getStatusVariant } from '@/components/shared/DataTable'
import { DeliveryStatus, UserRole } from '@/types/supabase'

interface DeliveriesClientProps {
  initialDeliveries: DeliveryWithItems[]
  userRole: UserRole
}

export default function DeliveriesClient({ initialDeliveries, userRole }: DeliveriesClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryWithItems | null>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<DeliveryStatus>('Draft')
  const [isUpdating, setIsUpdating] = useState(false)

  // Filter deliveries
  const filteredDeliveries = initialDeliveries.filter(delivery => {
    const matchesSearch = 
      delivery.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.warehouse?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async () => {
    if (!selectedDelivery) return
    setIsUpdating(true)
    
    try {
      await updateDeliveryStatus(selectedDelivery.id, newStatus)
      toast.success('Delivery status updated successfully')
      setShowStatusDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Failed to update delivery status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string, shortCode: string) => {
    if (!confirm(`Delete delivery ${shortCode}? This action cannot be undone.`)) return

    try {
      await deleteDelivery(id)
      toast.success('Delivery deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete delivery')
    }
  }

  const canManage = userRole === 'System Admin' || userRole === 'Warehouse Manager' || userRole === 'Warehouse Staff'

  return (
    <>
      <PageHeader
        title="Deliveries"
        subtitle="Manage outgoing stock to customers"
        action={canManage ? 'Create Delivery' : undefined}
        onAction={() => router.push('/deliveries/create')}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search deliveries..."
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
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          { 
            key: 'short_code', 
            label: 'Delivery ID',
            render: (delivery) => (
              <span className="font-mono font-medium">{delivery.short_code}</span>
            )
          },
          { 
            key: 'customer_name', 
            label: 'Customer',
            render: (delivery) => (
              <span className="font-medium text-foreground">{delivery.customer_name}</span>
            )
          },
          { 
            key: 'warehouse', 
            label: 'Warehouse',
            render: (delivery) => delivery.warehouse?.name || 'N/A'
          },
          { 
            key: 'delivery_date', 
            label: 'Delivery Date',
            render: (delivery) => delivery.delivery_date 
              ? new Date(delivery.delivery_date).toLocaleDateString() 
              : 'Not delivered'
          },
          { 
            key: 'status', 
            label: 'Status',
            render: (delivery) => (
              <Badge variant={getStatusVariant(delivery.status)}>
                {delivery.status}
              </Badge>
            )
          },
          { 
            key: 'created_at', 
            label: 'Created',
            render: (delivery) => new Date(delivery.created_at).toLocaleDateString()
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (delivery) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/deliveries/${delivery.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canManage && delivery.status !== 'Done' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDelivery(delivery)
                      setNewStatus(delivery.status)
                      setShowStatusDialog(true)
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
                {canManage && delivery.status === 'Draft' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(delivery.id, delivery.short_code)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            )
          }
        ]}
        data={filteredDeliveries}
        pageSize={10}
      />

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Delivery Status</DialogTitle>
            <DialogDescription>
              Change the status of delivery {selectedDelivery?.short_code}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as DeliveryStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Waiting">Waiting</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
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
    </>
  )
}
