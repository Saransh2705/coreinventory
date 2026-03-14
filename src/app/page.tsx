"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KPICard from "@/components/shared/KPICard";
import { TableSkeleton, KPICardSkeleton, PageTitleSkeleton } from "@/components/shared/Skeletons";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/components/shared/DataTable";
import { kpiData, recentReceipts, recentDeliveries, recentTransfers } from "@/lib/mock-data";
import {
  Package, AlertTriangle, XCircle, ClipboardList, Truck, ArrowLeftRight, Building2, MapPin,
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(false); }, []);

  const kpis = [
    { label: "Total Products", value: kpiData.totalProducts, icon: Package },
    { label: "Low Stock Items", value: kpiData.lowStockItems, icon: AlertTriangle, trend: "-12% vs last month", trendColor: "destructive" as const },
    { label: "Out of Stock", value: kpiData.outOfStockItems, icon: XCircle, trend: "+2", trendColor: "destructive" as const },
    { label: "Pending Receipts", value: kpiData.pendingReceipts, icon: ClipboardList },
    { label: "Pending Deliveries", value: kpiData.pendingDeliveries, icon: Truck },
    { label: "Scheduled Transfers", value: kpiData.scheduledTransfers, icon: ArrowLeftRight },
    { label: "Total Warehouses", value: kpiData.totalWarehouses, icon: Building2 },
    { label: "Total Locations", value: kpiData.totalLocations, icon: MapPin },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <PageTitleSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TableSkeleton columns={6} rows={5} />
          <TableSkeleton columns={6} rows={5} />
        </div>
        <TableSkeleton columns={5} rows={5} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System Ready. {kpiData.pendingReceipts} pending receipts require validation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-base font-medium text-foreground mb-3">Recent Receipts</h2>
          <DataTable
            columns={[
              { key: "id", label: "Receipt ID" },
              { key: "supplier", label: "Supplier" },
              { key: "warehouse", label: "Warehouse" },
              { key: "items", label: "Items", align: "right" },
              { key: "status", label: "Status", render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
              { key: "date", label: "Date" },
            ]}
            data={recentReceipts}
            pageSize={5}
          />
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground mb-3">Recent Deliveries</h2>
          <DataTable
            columns={[
              { key: "id", label: "Delivery ID" },
              { key: "customer", label: "Customer" },
              { key: "warehouse", label: "Warehouse" },
              { key: "items", label: "Items", align: "right" },
              { key: "status", label: "Status", render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
              { key: "date", label: "Date" },
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
            { key: "id", label: "Transfer ID" },
            { key: "fromLocation", label: "From Location" },
            { key: "toLocation", label: "To Location" },
            { key: "items", label: "Items", align: "right" },
            { key: "status", label: "Status", render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
          ]}
          data={recentTransfers}
          pageSize={5}
        />
      </div>
    </DashboardLayout>
  );
}
