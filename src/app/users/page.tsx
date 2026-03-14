"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/components/shared/DataTable";
import { users } from "@/lib/mock-data";
import { Pencil, Ban, KeyRound } from "lucide-react";

export default function UsersPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Users" subtitle="Manage system users and access" action="Create User" />
      <DataTable
        columns={[
          { key: "id", label: "User ID" },
          { key: "name", label: "Name", render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "warehouse", label: "Warehouse" },
          { key: "status", label: "Status", render: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
          {
            key: "actions",
            label: "Actions",
            render: () => (
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors"><Ban className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"><KeyRound className="w-3.5 h-3.5" /></button>
              </div>
            ),
          },
        ]}
        data={users}
        pageSize={10}
      />
    </DashboardLayout>
  );
}
