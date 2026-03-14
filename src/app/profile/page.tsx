"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PageTitleSkeleton, ProfileCardSkeleton } from "@/components/shared/Skeletons";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(false); }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <PageTitleSkeleton subtitle={false} />
        <ProfileCardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">My Profile</h1>
      </div>

      <div className="bg-card border border-border rounded-md p-6 max-w-lg">
        <div className="grid grid-cols-1 gap-4">
          {[
            ["Name", "Admin User"],
            ["Email", "admin@coreinv.com"],
            ["Role", "System Admin"],
            ["Assigned Warehouse", "All"],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
              <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="h-9 text-sm">Change Password</Button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
