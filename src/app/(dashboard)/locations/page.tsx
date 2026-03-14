"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { locations } from "@/lib/mock-data";
import { TableSkeleton, PageTitleSkeleton } from "@/components/shared/Skeletons";

export default function LocationsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(false); }, []);

  if (loading) {
    return (
      <>
        <PageTitleSkeleton />
        <TableSkeleton columns={6} rows={8} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Locations" subtitle="Racks and shelves across all warehouses" action="Create Location" />
      <DataTable
        columns={[
          { key: "id", label: "Location ID" },
          { key: "warehouse", label: "Warehouse" },
          { key: "shortCode", label: "Code" },
          { key: "rack", label: "Rack" },
          { key: "shelf", label: "Shelf" },
          { key: "stockItems", label: "Stock Items", align: "right" },
        ]}
        data={locations}
        pageSize={10}
      />
    </>
  );
}
