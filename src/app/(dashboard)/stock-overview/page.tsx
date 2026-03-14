"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/shared/DataTable";
import { TableSkeleton, PageTitleSkeleton, FilterBarSkeleton } from "@/components/shared/Skeletons";
import { stockItems } from "@/lib/mock-data";

export default function StockOverviewPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(false); }, []);
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const whs = ["All", ...new Set(stockItems.map((s) => s.warehouse))];

  const filtered = warehouseFilter === "All" ? stockItems : stockItems.filter((s) => s.warehouse === warehouseFilter);

  if (loading) {
    return (
      <>
        <PageTitleSkeleton />
        <FilterBarSkeleton />
        <TableSkeleton columns={7} rows={8} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">Stock Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Inventory distribution across locations</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {whs.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>

      <DataTable
        columns={[
          { key: "product", label: "Product", render: (r) => <span className="font-medium text-foreground">{r.product}</span> },
          { key: "sku", label: "SKU", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.sku}</span> },
          { key: "warehouse", label: "Warehouse" },
          { key: "location", label: "Location" },
          { key: "available", label: "Available", align: "right" },
          { key: "reserved", label: "Reserved", align: "right" },
          { key: "free", label: "Free", align: "right" },
        ]}
        data={filtered}
        pageSize={10}
      />
    </>
  );
}
