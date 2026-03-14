"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getStatusVariant } from "@/components/shared/DataTable";
import CreateUserForm from "@/components/users/CreateUserForm";
import { listUsers } from "@/lib/actions/auth";
import { Profile } from "@/types/supabase";
import { Pencil, Ban, KeyRound, UserPlus } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await listUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [dialogOpen]); // Refetch when dialog closes

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Users" 
        subtitle="Manage system users and access"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-9 px-4 text-sm font-medium">
              <UserPlus className="w-4 h-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <CreateUserForm />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading users...</div>
      ) : (
        <DataTable
          columns={[
            { 
              key: "email", 
              label: "Email", 
              render: (r) => <span className="font-medium text-foreground">{r.email}</span> 
            },
            { 
              key: "full_name", 
              label: "Name",
              render: (r) => <span className="text-foreground">{r.full_name || '-'}</span>
            },
            { 
              key: "role", 
              label: "Role",
              render: (r) => (
                <Badge variant={r.role === 'System Admin' ? 'default' : 'secondary'}>
                  {r.role}
                </Badge>
              )
            },
            { 
              key: "created_at", 
              label: "Created",
              render: (r) => <span className="text-muted-foreground">{formatDate(r.created_at)}</span>
            },
            {
              key: "actions",
              label: "Actions",
              render: () => (
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors">
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors">
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
          data={users}
          pageSize={10}
        />
      )}
    </DashboardLayout>
  );
}
