'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Plus, Trash2 } from 'lucide-react'
import { createDelivery } from '@/lib/actions/deliveries'
import { toast } from 'sonner'

interface Warehouse {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string
}

interface LineItem {
  product_id: string
  quantity: number
}

interface CreateDeliveryFormProps {
  warehouses: Warehouse[]
  products: Product[]
}

export default function CreateDeliveryForm({ warehouses, products }: CreateDeliveryFormProps) {
  const router = useRouter()
  const [customerName, setCustomerName] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ product_id: '', quantity: 1 }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }])

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items]
    if (field === 'quantity') {
      updated[index][field] = Number(value)
    } else {
      updated[index][field] = value as string
    }
    setItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!customerName.trim()) { setError('Customer name is required'); return }
    if (!warehouseId) { setError('Please select a warehouse'); return }

    const validItems = items.filter(item => item.product_id && item.quantity > 0)
    if (validItems.length === 0) { setError('Add at least one item'); return }

    setLoading(true)
    try {
      await createDelivery({
        customer_name: customerName.trim(),
        warehouse_id: warehouseId,
        notes: notes.trim() || undefined,
        items: validItems,
      })
      toast.success('Delivery created successfully')
      router.push('/deliveries')
    } catch (err) {
      console.error('Error creating delivery:', err)
      setError('Failed to create delivery. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedProductIds = items.map(i => i.product_id).filter(Boolean)

  return (
    <div className="space-y-6">
      <PageHeader title="Create Delivery" subtitle="Record outgoing stock to a customer" />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="max-w-3xl">
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Select value={item.product_id} onValueChange={(val) => updateItem(index, 'product_id', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id} disabled={selectedProductIds.includes(p.id) && item.product_id !== p.id}>
                              {p.name} ({p.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} placeholder="Qty" />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} disabled={items.length <= 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.push('/deliveries')}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Delivery'}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
