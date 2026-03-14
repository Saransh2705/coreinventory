import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/components/shared/DataTable";
import { ArrowLeft } from "lucide-react";
import { getProduct } from "@/lib/actions/products";

interface StockRow {
  id: string;
  warehouse: string;
  warehouseName: string;
  location: string;
  locationName: string;
  available: number;
  reserved: number;
  free: number;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getProduct(id);

  if (!result.success || !result.data) {
    return (
      <DashboardLayout>
        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <div className="bg-card border border-border rounded-md p-6 text-center">
          <p className="text-muted-foreground">{result.error || "Product not found"}</p>
        </div>
      </DashboardLayout>
    );
  }

  const product = result.data;
  const stockDistribution = (product.stock_distribution || []) as StockRow[];

  return (
    <DashboardLayout>
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-card border border-border rounded-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-medium text-foreground">{product.name}</h1>
          <Badge variant={getStatusVariant(product.status)}>{product.status}</Badge>
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            ["Short Code", product.short_code],
            ["SKU", product.sku],
            ["Category", product.category],
            ["Unit", product.unit],
            ["Stock Available", product.stock_available.toLocaleString()],
            ["Stock Reserved", product.stock_reserved.toLocaleString()],
            ["Free Stock", (product.stock_available - product.stock_reserved).toLocaleString()],
            ["Reorder Level", product.reorder_level.toLocaleString()],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
              <p className="text-foreground font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-base font-medium text-foreground mb-3">
        Stock Distribution
        {stockDistribution.length > 0 && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({stockDistribution.length} location{stockDistribution.length !== 1 ? "s" : ""})
          </span>
        )}
      </h2>
      {stockDistribution.length > 0 ? (
        <DataTable
          columns={[
            { key: "warehouse", label: "Warehouse", render: (r: StockRow) => <span className="font-medium text-foreground">{r.warehouse} <span className="text-muted-foreground font-normal">({r.warehouseName})</span></span> },
            { key: "location", label: "Location", render: (r: StockRow) => <span>{r.location}{r.locationName !== "—" ? ` (${r.locationName})` : ""}</span> },
            { key: "available", label: "Available", align: "right" as const, render: (r: StockRow) => <span className="tabular-nums">{r.available.toLocaleString()}</span> },
            { key: "reserved", label: "Reserved", align: "right" as const, render: (r: StockRow) => <span className="tabular-nums text-muted-foreground">{r.reserved.toLocaleString()}</span> },
            { key: "free", label: "Free", align: "right" as const, render: (r: StockRow) => <span className="tabular-nums font-medium">{r.free.toLocaleString()}</span> },
          ]}
          data={stockDistribution}
          pageSize={10}
        />
      ) : (
        <div className="bg-card border border-border rounded-md p-6 text-center">
          <p className="text-sm text-muted-foreground">No stock allocated yet. Add stock to warehouses/locations to see distribution here.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
