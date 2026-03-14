"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Warehouse as WarehouseIcon, Trash2 } from "lucide-react";
import CreateWarehouseForm from "@/components/warehouses/CreateWarehouseForm";
import { deleteWarehouse } from "@/lib/actions/warehouses";
import { Warehouse } from "@/types/supabase";

interface Props {
  initialWarehouses: Warehouse[];
  isAdmin: boolean;
}

export default function WarehousesClient({ initialWarehouses, isAdmin }: Props) {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    const result = await deleteWarehouse(id);
    if (result.success) {
      setWarehouses((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const handleCreated = () => {
    setDialogOpen(false);
    router.refresh();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Warehouses"
        subtitle={`${warehouses.length} warehouse${warehouses.length !== 1 ? "s" : ""} registered`}
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-9 px-4 text-sm font-medium"
              disabled={!isAdmin}
              title={!isAdmin ? "Only System Admins can create warehouses" : undefined}
            >
              <WarehouseIcon className="w-4 h-4" />
              Create Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Warehouse</DialogTitle>
            </DialogHeader>
            <CreateWarehouseForm onSuccess={handleCreated} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <DataTable
        columns={[
          {
            key: "short_code",
            label: "Code",
            render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.short_code}</span>,
          },
          {
            key: "name",
            label: "Name",
            render: (r) => <span className="font-medium text-foreground">{r.name}</span>,
          },
          {
            key: "address",
            label: "Address",
            render: (r) => <span className="text-muted-foreground">{r.address || "—"}</span>,
          },
          {
            key: "created_at",
            label: "Created",
            render: (r) => <span className="text-muted-foreground">{formatDate(r.created_at)}</span>,
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(r.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={warehouses}
        pageSize={10}
      />
    </DashboardLayout>
  );
}
