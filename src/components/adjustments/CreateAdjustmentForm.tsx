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
import { AlertCircle } from 'lucide-react'
import { createAdjustment, getProductStock } from '@/lib/actions/adjustments'
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

interface CreateAdjustmentFormProps {
  warehouses: Warehouse[]
  products: Product[]
}

export default function CreateAdjustmentForm({ warehouses, products }: CreateAdjustmentFormProps) {
  const router = useRouter()
  const [productId, setProductId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [beforeQuantity, setBeforeQuantity] = useState<number | ''>('')
  const [afterQuantity, setAfterQuantity] = useState<number | ''>('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [stockLoading, setStockLoading] = useState(false)

  const fetchCurrentStock = async (pid: string, wid: string) => {
    if (!pid || !wid) return
    setStockLoading(true)
    try {
      const qty = await getProductStock(pid, wid)
      setBeforeQuantity(qty)
    } catch {
      setBeforeQuantity(0)
    } finally {
      setStockLoading(false)
    }
  }

  const handleProductChange = (val: string) => {
    setProductId(val)
    fetchCurrentStock(val, warehouseId)
  }

  const handleWarehouseChange = (val: string) => {
    setWarehouseId(val)
    fetchCurrentStock(productId, val)
  }

  const difference = typeof beforeQuantity === 'number' && typeof afterQuantity === 'number'
    ? afterQuantity - beforeQuantity
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!productId) {
      setError('Please select a product')
      return
    }
    if (!warehouseId) {
      setError('Please select a warehouse')
      return
    }
    if (typeof beforeQuantity !== 'number') {
      setError('Before quantity is required')
      return
    }
    if (typeof afterQuantity !== 'number' || afterQuantity < 0) {
      setError('Please enter a valid after quantity (>= 0)')
      return
    }
    if (!reason.trim()) {
      setError('Please provide a reason for this adjustment')
      return
    }
    if (beforeQuantity === afterQuantity) {
      setError('After quantity must differ from before quantity')
      return
    }

    setLoading(true)

    try {
      await createAdjustment({
        product_id: productId,
        warehouse_id: warehouseId,
        before_quantity: beforeQuantity,
        after_quantity: afterQuantity,
        reason: reason.trim(),
      })

      toast.success('Adjustment created successfully')
      router.push('/adjustments')
    } catch (err) {
      console.error('Error creating adjustment:', err)
      setError('Failed to create adjustment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Adjustment"
        subtitle="Record a stock quantity correction"
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
            {/* Product & Warehouse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={productId} onValueChange={handleProductChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select value={warehouseId} onValueChange={handleWarehouseChange}>
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

            {/* Quantities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="before">Before Quantity</Label>
                <Input
                  id="before"
                  type="number"
                  min={0}
                  value={beforeQuantity}
                  onChange={(e) => setBeforeQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={stockLoading ? 'Loading...' : '0'}
                  disabled={stockLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="after">After Quantity</Label>
                <Input
                  id="after"
                  type="number"
                  min={0}
                  value={afterQuantity}
                  onChange={(e) => setAfterQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Difference</Label>
                <div className={`h-10 flex items-center px-3 rounded-md border text-sm font-medium ${
                  difference !== null && difference > 0
                    ? 'text-green-600 bg-green-50 dark:bg-green-950/20'
                    : difference !== null && difference < 0
                    ? 'text-red-600 bg-red-50 dark:bg-red-950/20'
                    : 'text-muted-foreground bg-muted'
                }`}>
                  {difference !== null ? (difference > 0 ? `+${difference}` : difference) : '—'}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Physical count mismatch, damaged goods, inventory audit..."
                rows={3}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.push('/adjustments')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Adjustment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
