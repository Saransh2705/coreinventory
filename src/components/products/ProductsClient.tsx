"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Eye, Trash2, PackagePlus } from "lucide-react";
import CreateProductForm from "@/components/products/CreateProductForm";
import { deleteProduct } from "@/lib/actions/products";

export interface ProductRow {
  id: string;
  name: string;
  short_code: string;
  sku: string;
  category: string;
  unit: string;
  reorder_level: number;
  stock_available: number;
  stock_reserved: number;
  status: string;
  created_at: string;
}

interface Props {
  initialProducts: ProductRow[];
  initialCategories: string[];
  isAdmin: boolean;
}

export default function ProductsClient({ initialProducts, initialCategories, isAdmin }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");

  const handleDelete = async (id: string) => {
    const result = await deleteProduct(id);
    if (result.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleCreated = () => {
    setDialogOpen(false);
    router.refresh();
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.short_code.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || p.category === category;
    const matchStatus = stockStatus === "All" || p.status === stockStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const stockStatuses = ["All", "In Stock", "Low Stock", "Out of Stock"];

  return (
    <DashboardLayout>
      <PageHeader title="Products" subtitle={`${products.length} products in inventory`}>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-9 px-4 text-sm font-medium"
              disabled={!isAdmin}
              title={!isAdmin ? "Only System Admins can create products" : undefined}
            >
              <PackagePlus className="w-4 h-4" />
              Create Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <CreateProductForm onSuccess={handleCreated} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, SKU, or code..."
            className="w-full h-9 pl-9 pr-3 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          <option value="All">All Categories</option>
          {initialCategories.map((c) => <option key={c} value={c}>{c}</option>)}
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
          { key: "short_code", label: "Code", render: (r: ProductRow) => <span className="font-mono text-xs text-muted-foreground">{r.short_code}</span> },
          { key: "name", label: "Product Name", render: (r: ProductRow) => <span className="font-medium text-foreground">{r.name}</span> },
          { key: "sku", label: "SKU", render: (r: ProductRow) => <span className="font-mono text-xs text-muted-foreground">{r.sku}</span> },
          { key: "category", label: "Category" },
          { key: "unit", label: "Unit" },
          { key: "stock_available", label: "Stock", align: "right" as const, render: (r: ProductRow) => <span className="tabular-nums">{r.stock_available.toLocaleString()}</span> },
          { key: "reorder_level", label: "Reorder Lvl", align: "right" as const, render: (r: ProductRow) => <span className="tabular-nums text-muted-foreground">{r.reorder_level.toLocaleString()}</span> },
          { key: "status", label: "Status", render: (r: ProductRow) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
          {
            key: "actions",
            label: "Actions",
            render: (r: ProductRow) => (
              <div className="flex items-center gap-1">
                <button onClick={() => router.push(`/products/${r.id}`)} className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                    className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={filtered}
        pageSize={10}
      />
    </DashboardLayout>
  );
}
