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
import { createTransfer } from '@/lib/actions/transfers'
import { toast } from 'sonner'

interface Location {
  id: string
  name: string
  warehouseName: string
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

interface CreateTransferFormProps {
  locations: Location[]
  products: Product[]
}

export default function CreateTransferForm({ locations, products }: CreateTransferFormProps) {
  const router = useRouter()
  const [fromLocationId, setFromLocationId] = useState('')
  const [toLocationId, setToLocationId] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
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

    if (!fromLocationId) { setError('Select a source location'); return }
    if (!toLocationId) { setError('Select a destination location'); return }
    if (fromLocationId === toLocationId) { setError('Source and destination must be different'); return }

    const validItems = items.filter(item => item.product_id && item.quantity > 0)
    if (validItems.length === 0) { setError('Add at least one item'); return }

    setLoading(true)
    try {
      await createTransfer({
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
        scheduled_date: scheduledDate || undefined,
        notes: notes.trim() || undefined,
        items: validItems,
      })
      toast.success('Transfer created successfully')
      router.push('/transfers')
    } catch (err) {
      console.error('Error creating transfer:', err)
      setError('Failed to create transfer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedProductIds = items.map(i => i.product_id).filter(Boolean)

  // Group locations by warehouse for better UX
  const warehouseGroups = locations.reduce<Record<string, Location[]>>((acc, loc) => {
    const key = loc.warehouseName || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(loc)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <PageHeader title="Create Transfer" subtitle="Move stock between locations" />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="max-w-3xl">
          <CardContent className="pt-6 space-y-6">
            {/* From / To Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Location</Label>
                <Select value={fromLocationId} onValueChange={setFromLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(warehouseGroups).map(([wh, locs]) => (
                      <div key={wh}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{wh}</div>
                        {locs.map(loc => (
                          <SelectItem key={loc.id} value={loc.id} disabled={loc.id === toLocationId}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Location</Label>
                <Select value={toLocationId} onValueChange={setToLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(warehouseGroups).map(([wh, locs]) => (
                      <div key={wh}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{wh}</div>
                        {locs.map(loc => (
                          <SelectItem key={loc.id} value={loc.id} disabled={loc.id === fromLocationId}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Scheduled Date & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date (optional)</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={1}
                />
              </div>
            </div>

            {/* Items */}
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.push('/transfers')}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Transfer'}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
