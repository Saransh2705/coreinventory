"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { warehouses } from "@/lib/mock-data";

export default function WarehousesPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Warehouses" subtitle={`${warehouses.length} warehouses registered`} action="Create Warehouse" />
      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name", render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
          { key: "shortCode", label: "Code" },
          { key: "address", label: "Address" },
          { key: "manager", label: "Manager" },
          { key: "locationsCount", label: "Locations", align: "right" },
        ]}
        data={warehouses}
        pageSize={10}
      />
    </DashboardLayout>
  );
}
