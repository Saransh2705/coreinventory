"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/components/shared/DataTable";
import { products, categories, stockStatuses } from "@/lib/mock-data";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || p.category === category;
    const matchStatus = stockStatus === "All" || p.status === stockStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <DashboardLayout>
      <PageHeader title="Products" subtitle={`${products.length} products in inventory`} action="Create Product" />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or SKU..."
            className="w-full h-9 pl-9 pr-3 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {stockStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Product Name", render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
          { key: "sku", label: "SKU", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.sku}</span> },
          { key: "category", label: "Category" },
          { key: "unit", label: "Unit" },
          { key: "stockAvailable", label: "Stock", align: "right" },
          { key: "reorderLevel", label: "Reorder Lvl", align: "right" },
          { key: "status", label: "Status", render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <div className="flex items-center gap-1">
                <button onClick={() => router.push(`/products/${r.id}`)} className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ),
          },
        ]}
        data={filtered}
        pageSize={8}
      />
    </DashboardLayout>
  );
}
