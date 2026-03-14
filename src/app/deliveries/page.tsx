"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/components/shared/DataTable";
import { recentDeliveries } from "@/lib/mock-data";

export default function DeliveriesPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Deliveries" subtitle="Manage outgoing stock to customers" action="Create Delivery" />
      <DataTable
        columns={[
          { key: "id", label: "Delivery ID" },
          { key: "customer", label: "Customer", render: (r) => <span className="font-medium text-foreground">{r.customer}</span> },
          { key: "warehouse", label: "Warehouse" },
          { key: "items", label: "Items", align: "right" },
          { key: "status", label: "Status", render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
          { key: "date", label: "Date" },
        ]}
        data={recentDeliveries}
        pageSize={10}
      />
    </DashboardLayout>
  );
}
