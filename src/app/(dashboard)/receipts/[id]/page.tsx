import { getReceipt } from '@/lib/actions/receipts'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReceiptActions } from '@/components/receipts/ReceiptActions'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const dynamic = 'force-dynamic'

interface ReceiptDetailPageProps {
  params: Promise<{ id: string }>
}

function getStatusVariant(status: string) {
  const map: Record<string, "success" | "warning" | "destructive" | "draft" | "waiting" | "default"> = {
    "Done": "success",
    "Ready": "success",
    "Waiting": "waiting",
    "Cancelled": "destructive",
    "Draft": "draft",
  }
  return map[status] || "default"
}

export default async function ReceiptDetailPage({ params }: ReceiptDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  let receipt
  try {
    receipt = await getReceipt(id)
  } catch (error) {
    console.error('Error loading receipt:', error)
    notFound()
  }

  const totalQuantity = receipt.items.reduce((sum, item) => sum + item.quantity, 0)

  const printData = {
    shortCode: receipt.short_code,
    status: receipt.status,
    supplierName: receipt.supplier_name,
    warehouseName: receipt.warehouse?.name || 'N/A',
    receivedDate: receipt.received_date
      ? new Date(receipt.received_date).toLocaleDateString('en-US')
      : 'Not received',
    createdDate: new Date(receipt.created_at).toLocaleDateString('en-US'),
    createdBy: receipt.created_by_user?.full_name || '',
    notes: receipt.notes || '',
    items: receipt.items.map(item => ({
      name: item.product?.name || 'Unknown Product',
      shortCode: item.product?.short_code || '',
      sku: item.product?.sku || 'N/A',
      location: item.location?.name || 'Unassigned',
      quantity: item.quantity,
    })),
    totalQuantity,
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <ReceiptActions printData={printData} />

      {/* Receipt Content */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">GOODS RECEIPT</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">CoreInventory</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono">{receipt.short_code}</div>
              <Badge variant={getStatusVariant(receipt.status)} className="mt-1">
                {receipt.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Supplier Information</h3>
              <p className="text-base font-semibold">{receipt.supplier_name}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Receipt Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Warehouse:</span>
                  <span className="font-medium">{receipt.warehouse?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Received:</span>
                  <span className="font-medium">
                    {receipt.received_date
                      ? new Date(receipt.received_date).toLocaleDateString('en-US')
                      : 'Not received'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{new Date(receipt.created_at).toLocaleDateString('en-US')}</span>
                </div>
                {receipt.created_by_user?.full_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">By:</span>
                    <span className="font-medium">{receipt.created_by_user.full_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <>
              <Separator />
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</h4>
                <p className="text-sm whitespace-pre-wrap">{receipt.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Items</h4>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-2 px-3 text-xs font-semibold" style={{ width: '5%' }}>#</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold" style={{ width: '40%' }}>Product</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold" style={{ width: '20%' }}>SKU</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold" style={{ width: '20%' }}>Location</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold" style={{ width: '15%' }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No items in this receipt
                      </td>
                    </tr>
                  ) : (
                    receipt.items.map((item, index) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-2 px-3 text-sm text-muted-foreground">{index + 1}</td>
                        <td className="py-2 px-3">
                          <p className="text-sm font-medium">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-xs text-muted-foreground">{item.product?.short_code}</p>
                        </td>
                        <td className="py-2 px-3 text-sm font-mono">{item.product?.sku || 'N/A'}</td>
                        <td className="py-2 px-3 text-sm">{item.location?.name || 'Unassigned'}</td>
                        <td className="py-2 px-3 text-right text-sm font-semibold">{item.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="bg-muted/50 py-3 px-3 flex justify-between items-center border-t-2">
                <span className="text-sm font-bold">TOTAL QUANTITY</span>
                <span className="text-lg font-bold">{totalQuantity}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Signatures */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Authorization Signatures</h4>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Warehouse Staff</p>
                <div className="border-b border-muted-foreground/30 mb-1 min-h-[30px]"></div>
                <div className="flex justify-between text-xs text-muted-foreground mb-3">
                  <span>Signature</span>
                  <span>Date: __________</span>
                </div>
                <div className="border-b border-muted-foreground/30 mb-1"></div>
                <p className="text-xs text-muted-foreground">Printed Name</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Manager/Supervisor</p>
                <div className="border-b border-muted-foreground/30 mb-1 min-h-[30px]"></div>
                <div className="flex justify-between text-xs text-muted-foreground mb-3">
                  <span>Signature</span>
                  <span>Date: __________</span>
                </div>
                <div className="border-b border-muted-foreground/30 mb-1"></div>
                <p className="text-xs text-muted-foreground">Printed Name</p>
              </div>
            </div>
          </div>

          <Separator />
          <p className="text-center text-xs text-muted-foreground">
            This document serves as proof of receipt of goods listed above.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
