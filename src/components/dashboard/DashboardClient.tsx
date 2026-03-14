'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import KPICard from '@/components/shared/KPICard'
import DataTable from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { getStatusVariant } from '@/components/shared/DataTable'
import { DashboardKPIs } from '@/types/supabase'
import {
  Package, AlertTriangle, XCircle, ClipboardList, Truck, ArrowLeftRight, Building2, MapPin,
} from 'lucide-react'

interface DashboardClientProps {
  kpis: DashboardKPIs
  recentReceipts: any[]
  recentDeliveries: any[]
  recentTransfers: any[]
}

export default function DashboardClient({
  kpis,
  recentReceipts,
  recentDeliveries,
  recentTransfers,
}: DashboardClientProps) {
  const kpiCards = [
    { label: 'Total Products', value: kpis.total_products, icon: Package },
    { 
      label: 'Low Stock Items', 
      value: kpis.low_stock_items, 
      icon: AlertTriangle,
      ...(kpis.low_stock_items > 0 && { trendColor: 'destructive' as const })
    },
    { 
      label: 'Out of Stock', 
      value: kpis.out_of_stock_items, 
      icon: XCircle,
      ...(kpis.out_of_stock_items > 0 && { trendColor: 'destructive' as const })
    },
    { label: 'Pending Receipts', value: kpis.pending_receipts, icon: ClipboardList },
    { label: 'Pending Deliveries', value: kpis.pending_deliveries, icon: Truck },
    { label: 'Scheduled Transfers', value: kpis.scheduled_transfers, icon: ArrowLeftRight },
    { label: 'Total Warehouses', value: kpis.total_warehouses, icon: Building2 },
    { label: 'Total Locations', value: kpis.total_locations, icon: MapPin },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {kpis.pending_receipts > 0 
            ? `System Ready. ${kpis.pending_receipts} pending receipts require validation.`
            : 'System operational. All receipts processed.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-base font-medium text-foreground mb-3">Recent Receipts</h2>
          <DataTable
            columns={[
              { 
                key: 'short_code', 
                label: 'Receipt ID',
                render: (r) => <span className="font-mono text-sm">{r.short_code}</span>
              },
              { 
                key: 'supplier_name', 
                label: 'Supplier',
                render: (r) => <span className="font-medium">{r.supplier_name}</span>
              },
              { 
                key: 'warehouse', 
                label: 'Warehouse',
                render: (r) => r.warehouse?.name || 'N/A'
              },
              { 
                key: 'status', 
                label: 'Status', 
                render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> 
              },
              { 
                key: 'created_at', 
                label: 'Date',
                render: (r) => new Date(r.created_at).toLocaleDateString()
              },
            ]}
            data={recentReceipts}
            pageSize={5}
          />
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground mb-3">Recent Deliveries</h2>
          <DataTable
            columns={[
              { 
                key: 'short_code', 
                label: 'Delivery ID',
                render: (r) => <span className="font-mono text-sm">{r.short_code}</span>
              },
              { 
                key: 'customer_name', 
                label: 'Customer',
                render: (r) => <span className="font-medium">{r.customer_name}</span>
              },
              { 
                key: 'warehouse', 
                label: 'Warehouse',
                render: (r) => r.warehouse?.name || 'N/A'
              },
              { 
                key: 'status', 
                label: 'Status', 
                render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> 
              },
              { 
                key: 'created_at', 
                label: 'Date',
                render: (r) => new Date(r.created_at).toLocaleDateString()
              },
            ]}
            data={recentDeliveries}
            pageSize={5}
          />
        </div>
      </div>

      <div>
        <h2 className="text-base font-medium text-foreground mb-3">Recent Transfers</h2>
        <DataTable
          columns={[
            { 
              key: 'short_code', 
              label: 'Transfer ID',
              render: (r) => <span className="font-mono text-sm">{r.short_code}</span>
            },
            { 
              key: 'from_location', 
              label: 'From',
              render: (r) => r.from_location?.name || 'N/A'
            },
            { 
              key: 'to_location', 
              label: 'To',
              render: (r) => r.to_location?.name || 'N/A'
            },
            { 
              key: 'status', 
              label: 'Status', 
              render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> 
            },
            { 
              key: 'created_at', 
              label: 'Date',
              render: (r) => new Date(r.created_at).toLocaleDateString()
            },
          ]}
          data={recentTransfers}
          pageSize={5}
        />
      </div>
    </DashboardLayout>
  )
}
