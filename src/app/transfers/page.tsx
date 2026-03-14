"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/components/shared/DataTable";
import { recentTransfers } from "@/lib/mock-data";

export default function TransfersPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Internal Transfers" subtitle="Move stock between locations" action="Create Transfer" />
      <DataTable
        columns={[
          { key: "id", label: "Transfer ID" },
          { key: "fromLocation", label: "From Location" },
          { key: "toLocation", label: "To Location" },
          { key: "items", label: "Items", align: "right" },
          { key: "status", label: "Status", render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
        ]}
        data={recentTransfers}
        pageSize={10}
      />
    </DashboardLayout>
  );
}
