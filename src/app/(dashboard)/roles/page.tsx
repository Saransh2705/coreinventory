"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { PageTitleSkeleton, RoleCardSkeleton } from "@/components/shared/Skeletons";

const roles = [
  { name: "System Admin", description: "Full system access. Can manage warehouses, all users, and system settings.", permissions: ["Create/Edit Warehouses", "Create Managers & Viewers", "View all data", "Manage roles"] },
  { name: "Warehouse Manager", description: "Manages a specific warehouse. Can create staff and process operations.", permissions: ["Create Staff", "Create receipts/deliveries/transfers", "View warehouse inventory"] },
  { name: "Warehouse Staff", description: "Operational role. Processes deliveries, receipts, and transfers.", permissions: ["Process deliveries/receipts", "Execute transfers", "Update movements"] },
  { name: "Viewer", description: "Read-only access to dashboard, inventory, and reports.", permissions: ["View dashboard", "View inventory", "View reports"] },
];

export default function RolesPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(false); }, []);

  if (loading) {
    return (
      <>
        <PageTitleSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <RoleCardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Roles</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System role definitions and permissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <div key={role.name} className="bg-card border border-border rounded-md p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">{role.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{role.description}</p>
            <div className="flex flex-col gap-1">
              {role.permissions.map((p) => (
                <span key={p} className="text-xs text-foreground">• {p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
