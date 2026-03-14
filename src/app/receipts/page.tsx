"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { TableSkeleton, PageTitleSkeleton } from "@/components/shared/Skeletons";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/components/shared/DataTable";
import { recentReceipts } from "@/lib/mock-data";

export default function ReceiptsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(false); }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <PageTitleSkeleton />
        <TableSkeleton columns={6} rows={8} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Receipts" subtitle="Manage incoming stock from suppliers" action="Create Receipt" />
      <DataTable
        columns={[
          { key: "id", label: "Receipt ID" },
          { key: "supplier", label: "Supplier", render: (r) => <span className="font-medium text-foreground">{r.supplier}</span> },
          { key: "warehouse", label: "Warehouse" },
          { key: "items", label: "Items", align: "right" },
          { key: "status", label: "Status", render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
          { key: "date", label: "Date" },
        ]}
        data={recentReceipts}
        pageSize={10}
      />
    </DashboardLayout>
  );
}
