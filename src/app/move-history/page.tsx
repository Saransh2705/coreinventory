"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/components/shared/DataTable";
import { moveHistory } from "@/lib/mock-data";
import { Search } from "lucide-react";

export default function MoveHistoryPage() {
  const [search, setSearch] = useState("");
  const filtered = moveHistory.filter(
    (m) => m.product.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">Move History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All inventory movement records</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or move ID..."
            className="w-full h-9 pl-9 pr-3 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { key: "id", label: "Move ID" },
          { key: "product", label: "Product", render: (r) => <span className="font-medium text-foreground">{r.product}</span> },
          { key: "fromLocation", label: "From" },
          { key: "toLocation", label: "To" },
          { key: "quantity", label: "Quantity", align: "right" },
          { key: "date", label: "Date" },
          { key: "status", label: "Status", render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
        ]}
        data={filtered}
        pageSize={10}
      />
    </DashboardLayout>
  );
}
