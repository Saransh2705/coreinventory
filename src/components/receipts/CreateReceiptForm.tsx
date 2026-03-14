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
import { createReceipt } from '@/lib/actions/receipts'
import { toast } from 'sonner'

interface Warehouse {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string
  short_code: string
}

interface LineItem {
  product_id: string
  quantity: number
}

interface CreateReceiptFormProps {
  warehouses: Warehouse[]
  products: Product[]
}

export default function CreateReceiptForm({ warehouses, products }: CreateReceiptFormProps) {
  const router = useRouter()
  const [supplierName, setSupplierName] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ product_id: '', quantity: 1 }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }])
  }

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

    if (!supplierName.trim()) {
      setError('Supplier name is required')
      return
    }
    if (!warehouseId) {
      setError('Please select a warehouse')
      return
    }

    const validItems = items.filter(item => item.product_id && item.quantity > 0)
    if (validItems.length === 0) {
      setError('Add at least one item with a valid product and quantity')
      return
    }

    setLoading(true)

    try {
      await createReceipt({
        supplier_name: supplierName.trim(),
        warehouse_id: warehouseId,
        notes: notes.trim() || undefined,
        items: validItems,
      })

      toast.success('Receipt created successfully')
      router.push('/receipts')
    } catch (err) {
      console.error('Error creating receipt:', err)
      setError('Failed to create receipt. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedProductIds = items.map(i => i.product_id).filter(Boolean)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Receipt"
        subtitle="Record incoming stock from a supplier"
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="max-w-3xl">
          <CardContent className="pt-6 space-y-6">
            {/* Supplier & Warehouse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier Name</Label>
                <Input
                  id="supplier"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g. Mumbai Manufacturing Co."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
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

            {/* Notes */}
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

            {/* Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Select
                        value={item.product_id}
                        onValueChange={(val) => updateItem(index, 'product_id', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              disabled={selectedProductIds.includes(p.id) && item.product_id !== p.id}
                            >
                              {p.name} ({p.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.push('/receipts')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Receipt'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
