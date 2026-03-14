"use client";

import Link from "next/link";
import { use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/DataTable";
import { products, stockItems, moveHistory } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = products.find((p) => p.id === id) || products[0];

  const relatedStock = stockItems.filter((s) => s.product === product.name);
  const relatedMoves = moveHistory.filter((m) => m.product === product.name);

  return (
    <DashboardLayout>
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-card border border-border rounded-md p-6 mb-6">
        <h1 className="text-xl font-medium text-foreground mb-4">{product.name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            ["SKU", product.sku],
            ["Category", product.category],
            ["Unit", product.unit],
            ["Status", product.status],
            ["Stock Available", product.stockAvailable.toLocaleString()],
            ["Reorder Level", product.reorderLevel.toLocaleString()],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
              <p className="text-foreground font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-base font-medium text-foreground mb-3">Stock Distribution</h2>
      <div className="mb-6">
        <DataTable
          columns={[
            { key: "warehouse", label: "Warehouse" },
            { key: "location", label: "Location" },
            { key: "available", label: "Available", align: "right" },
            { key: "reserved", label: "Reserved", align: "right" },
            { key: "free", label: "Free", align: "right" },
          ]}
          data={relatedStock}
          pageSize={10}
        />
      </div>

      <h2 className="text-base font-medium text-foreground mb-3">Movement History</h2>
      <DataTable
        columns={[
          { key: "id", label: "Move ID" },
          { key: "fromLocation", label: "From" },
          { key: "toLocation", label: "To" },
          { key: "quantity", label: "Quantity", align: "right" },
          { key: "date", label: "Date" },
        ]}
        data={relatedMoves}
        pageSize={10}
      />
    </DashboardLayout>
  );
}
