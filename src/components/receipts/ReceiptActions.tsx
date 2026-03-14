'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'

interface PrintItem {
  name: string
  shortCode: string
  sku: string
  location: string
  quantity: number
}

interface PrintData {
  shortCode: string
  status: string
  supplierName: string
  warehouseName: string
  receivedDate: string
  createdDate: string
  createdBy: string
  notes: string
  items: PrintItem[]
  totalQuantity: number
}

interface ReceiptActionsProps {
  printData: PrintData
}

function buildPrintHtml(d: PrintData): string {
  const rows = d.items.map((item, i) => `
    <tr style="border-bottom:1px solid #e5e5e5">
      <td style="padding:6px 8px;font-size:12px;color:#666">${i + 1}</td>
      <td style="padding:6px 8px"><div style="font-size:12px;font-weight:600">${item.name}</div><div style="font-size:10px;color:#888">${item.shortCode}</div></td>
      <td style="padding:6px 8px;font-size:12px;font-family:monospace">${item.sku}</td>
      <td style="padding:6px 8px;font-size:12px">${item.location}</td>
      <td style="padding:6px 8px;text-align:right;font-size:12px;font-weight:600">${item.quantity}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html><head><title>Receipt - ${d.shortCode}</title>
<style>
  @page{size:A4;margin:15mm}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fff;color:#111;font-size:13px}
  table{width:100%;border-collapse:collapse}
</style>
</head><body>
<div style="max-width:180mm;margin:0 auto">
  <div style="border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <h1 style="font-size:22px;font-weight:700">GOODS RECEIPT</h1>
      <div style="font-size:11px;color:#666;margin-top:2px">CoreInventory</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:700;font-family:monospace">${d.shortCode}</div>
      <span style="display:inline-block;border:1px solid #666;border-radius:4px;padding:1px 8px;font-size:11px;margin-top:4px">${d.status}</span>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:16px">
    <div>
      <div style="font-size:10px;font-weight:600;color:#888;text-transform:uppercase;margin-bottom:4px">Supplier</div>
      <div style="font-size:14px;font-weight:600">${d.supplierName}</div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:600;color:#888;text-transform:uppercase;margin-bottom:4px">Details</div>
      <div style="font-size:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="color:#666">Warehouse:</span><span style="font-weight:600">${d.warehouseName}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="color:#666">Received:</span><span style="font-weight:600">${d.receivedDate}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="color:#666">Created:</span><span style="font-weight:600">${d.createdDate}</span></div>
        ${d.createdBy ? `<div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="color:#666">By:</span><span style="font-weight:600">${d.createdBy}</span></div>` : ''}
      </div>
    </div>
  </div>
  ${d.notes ? `<div style="margin-bottom:16px;padding:8px 10px;background:#f5f5f5;border:1px solid #ddd;border-radius:4px"><div style="font-size:10px;font-weight:600;color:#888;text-transform:uppercase;margin-bottom:2px">Notes</div><div style="font-size:12px;color:#333">${d.notes}</div></div>` : ''}
  <table>
    <thead>
      <tr style="background:#f0f0f0">
        <th style="text-align:left;padding:6px 8px;font-size:10px;font-weight:600;color:#555;border-bottom:2px solid #ccc;width:5%">#</th>
        <th style="text-align:left;padding:6px 8px;font-size:10px;font-weight:600;color:#555;border-bottom:2px solid #ccc;width:40%">PRODUCT</th>
        <th style="text-align:left;padding:6px 8px;font-size:10px;font-weight:600;color:#555;border-bottom:2px solid #ccc;width:20%">SKU</th>
        <th style="text-align:left;padding:6px 8px;font-size:10px;font-weight:600;color:#555;border-bottom:2px solid #ccc;width:20%">LOCATION</th>
        <th style="text-align:right;padding:6px 8px;font-size:10px;font-weight:600;color:#555;border-bottom:2px solid #ccc;width:15%">QTY</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="background:#f0f0f0;padding:10px 8px;display:flex;justify-content:space-between;align-items:center;border-top:2px solid #ccc">
    <span style="font-size:12px;font-weight:700">TOTAL QUANTITY</span>
    <span style="font-size:18px;font-weight:700">${d.totalQuantity}</span>
  </div>
  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #ccc">
    <div style="font-size:10px;font-weight:600;color:#888;text-transform:uppercase;margin-bottom:12px">Authorization Signatures</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
      <div>
        <div style="font-size:11px;color:#555;margin-bottom:4px">Warehouse Staff</div>
        <div style="border-bottom:1px solid #999;min-height:30px;margin-bottom:4px"></div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#888;margin-bottom:10px"><span>Signature</span><span>Date: __________</span></div>
        <div style="border-bottom:1px solid #999;margin-bottom:2px"></div>
        <div style="font-size:10px;color:#888">Printed Name</div>
      </div>
      <div>
        <div style="font-size:11px;color:#555;margin-bottom:4px">Manager/Supervisor</div>
        <div style="border-bottom:1px solid #999;min-height:30px;margin-bottom:4px"></div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#888;margin-bottom:10px"><span>Signature</span><span>Date: __________</span></div>
        <div style="border-bottom:1px solid #999;margin-bottom:2px"></div>
        <div style="font-size:10px;color:#888">Printed Name</div>
      </div>
    </div>
  </div>
  <div style="margin-top:16px;padding-top:8px;border-top:1px solid #e5e5e5;text-align:center;font-size:10px;color:#888">
    This document serves as proof of receipt of goods listed above.
  </div>
</div>
</body></html>`
}

export function ReceiptActions({ printData }: ReceiptActionsProps) {
  const router = useRouter()

  const handleDownload = () => {
    const html = buildPrintHtml(printData)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={() => router.push('/receipts')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Receipts
      </Button>
      <Button onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download PDF
      </Button>
    </div>
  )
}
