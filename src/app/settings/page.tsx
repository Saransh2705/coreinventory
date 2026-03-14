"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PageTitleSkeleton, FormSkeleton } from "@/components/shared/Skeletons";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(false); }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <PageTitleSkeleton />
        <div className="space-y-6 max-w-2xl">
          <FormSkeleton fields={2} />
          <FormSkeleton fields={2} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System configuration</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-card border border-border rounded-md p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Company Name</label>
              <input
                defaultValue="CoreInventory Inc."
                className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Timezone</label>
              <select className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-md p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Inventory Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Low Stock Threshold (%)</label>
              <input
                type="number"
                defaultValue={15}
                className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Notification Preferences</label>
              <select className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                <option>Email + In-App</option>
                <option>Email Only</option>
                <option>In-App Only</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>
        </div>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 px-6 text-sm font-medium">
            Save Changes
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
