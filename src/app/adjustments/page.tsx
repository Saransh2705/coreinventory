"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { PageTitleSkeleton, FormSkeleton } from "@/components/shared/Skeletons";

export default function AdjustmentsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(false); }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <PageTitleSkeleton />
        <FormSkeleton fields={4} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Inventory Adjustments" subtitle="Correct stock mismatches" action="New Adjustment" />
      <div className="bg-card border border-border rounded-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Product</label>
            <select className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
              <option>Select product...</option>
              <option>Industrial Compressor V2</option>
              <option>Hydraulic Pump HP-400</option>
              <option>Steel Beam 6m Q235</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Warehouse</label>
            <select className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
              <option>Select warehouse...</option>
              <option>WH-A</option>
              <option>WH-B</option>
              <option>WH-C</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Location</label>
            <select className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
              <option>Select location...</option>
              <option>A-R1-S1</option>
              <option>A-R1-S2</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Counted Quantity</label>
            <input
              type="number"
              placeholder="Enter actual count"
              className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>
        <div className="mt-4 p-3 bg-muted rounded-md">
          <span className="text-xs text-muted-foreground">System Quantity: <strong className="text-foreground tabular-nums">640</strong> · Difference: <strong className="text-destructive tabular-nums">—</strong></span>
        </div>
      </div>
    </DashboardLayout>
  );
}
