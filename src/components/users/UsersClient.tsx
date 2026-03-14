"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CreateUserForm from "@/components/users/CreateUserForm";
import { listUsers, listWarehouses, resendInvite, toggleDisableUser, sendPasswordReset, deleteUser, updateUserRole } from "@/lib/actions/auth";
import { Profile, UserRole, Warehouse } from "@/types/supabase";
import { MoreHorizontal, Pencil, Ban, ShieldCheck, KeyRound, UserPlus, MailPlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialUsers: Profile[];
  currentUser: Profile;
}

export default function UsersClient({ initialUsers, currentUser }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Confirmation dialogs
  const [disableTarget, setDisableTarget] = useState<Profile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [resetTarget, setResetTarget] = useState<Profile | null>(null);
  const [editTarget, setEditTarget] = useState<Profile | null>(null);

  // Edit role form state
  const [editRole, setEditRole] = useState<UserRole | "">("");
  const [editWarehouseId, setEditWarehouseId] = useState<string>("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const isWarehouseManager = currentUser.role === "Warehouse Manager";
  const canManageUsers = !["Warehouse Staff", "Viewer"].includes(currentUser.role);

  const allowedRoles: UserRole[] = isWarehouseManager
    ? ["Warehouse Staff", "Viewer"]
    : ["Warehouse Manager", "Warehouse Staff", "Viewer"];

  const refreshUsers = async () => {
    const result = await listUsers();
    if (result.success && result.data) {
      setUsers(result.data.filter((u) => u.role !== "System Admin"));
    }
  };

  const handleCreated = () => {
    setDialogOpen(false);
    router.refresh();
  };

  const handleResendInvite = async (user: Profile) => {
    setActionLoading(user.id);
    const result = await resendInvite(user.id, user.email);
    if (result.success) {
      toast.success("Invitation resent", { description: `Sent to ${user.email}` });
    } else {
      toast.error("Failed to resend", { description: result.error });
    }
    setActionLoading(null);
  };

  const handleToggleDisable = async () => {
    if (!disableTarget) return;
    setActionLoading(disableTarget.id);
    const newState = !disableTarget.disabled;
    const result = await toggleDisableUser(disableTarget.id, newState);
    if (result.success) {
      toast.success(newState ? "User disabled" : "User enabled", {
        description: `${disableTarget.email} has been ${newState ? "disabled" : "enabled"}`,
      });
      refreshUsers();
    } else {
      toast.error("Action failed", { description: result.error });
    }
    setActionLoading(null);
    setDisableTarget(null);
  };

  const handleSendPasswordReset = async () => {
    if (!resetTarget) return;
    setActionLoading(resetTarget.id);
    const result = await sendPasswordReset(resetTarget.id, resetTarget.email);
    if (result.success) {
      toast.success("Password reset sent", { description: `Link sent to ${resetTarget.email}` });
    } else {
      toast.error("Failed to send reset", { description: result.error });
    }
    setActionLoading(null);
    setResetTarget(null);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    const result = await deleteUser(deleteTarget.id);
    if (result.success) {
      toast.success("User deleted", { description: `${deleteTarget.email} has been removed` });
      refreshUsers();
    } else {
      toast.error("Failed to delete", { description: result.error });
    }
    setActionLoading(null);
    setDeleteTarget(null);
  };

  const handleEditRole = async () => {
    if (!editTarget || !editRole) return;
    setActionLoading(editTarget.id);
    const needsWarehouse = editRole === "Warehouse Manager" || editRole === "Warehouse Staff";
    const wId = isWarehouseManager ? currentUser.warehouse_id : (needsWarehouse ? editWarehouseId : null);
    const result = await updateUserRole(editTarget.id, editRole as UserRole, wId);
    if (result.success) {
      toast.success("Role updated", { description: `${editTarget.email} is now ${editRole}` });
      refreshUsers();
    } else {
      toast.error("Failed to update role", { description: result.error });
    }
    setActionLoading(null);
    setEditTarget(null);
    setEditRole("");
    setEditWarehouseId("");
  };

  const openEditDialog = async (user: Profile) => {
    setEditTarget(user);
    setEditRole(user.role);
    setEditWarehouseId(user.warehouse_id || "");
    if (!isWarehouseManager && warehouses.length === 0) {
      const result = await listWarehouses();
      if (result.success && result.data) setWarehouses(result.data);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const editNeedsWarehouse = editRole === "Warehouse Manager" || editRole === "Warehouse Staff";

  return (
    <>
      <PageHeader 
        title="Users" 
        subtitle="Manage system users and access"
      >
        {canManageUsers && (
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
              <CreateUserForm
                currentUserRole={currentUser.role}
                currentUserWarehouseId={currentUser.warehouse_id}
              />
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <DataTable
        columns={[
          ...(!canManageUsers ? [] : [{ 
            key: "email" as const, 
            label: "Email", 
            render: (r: Profile) => <span className="font-medium text-foreground">{r.email}</span> 
          }]),
          { 
            key: "full_name", 
            label: "Name",
            render: (r: Profile) => <span className="text-foreground">{r.full_name || '-'}</span>
          },
          { 
            key: "role", 
            label: "Role",
            render: (r: Profile) => (
              <Badge variant={r.role === 'System Admin' ? 'default' : 'secondary'}>
                {r.role}
              </Badge>
            )
          },
          ...(!canManageUsers ? [] : [
            { 
              key: "created_at" as const, 
              label: "Created",
              render: (r: Profile) => <span className="text-muted-foreground">{formatDate(r.created_at)}</span>
            },
            {
              key: "is_verified" as const,
              label: "Status",
              render: (r: Profile) => (
                r.disabled
                  ? <Badge variant="destructive">Disabled</Badge>
                  : r.is_verified 
                    ? <Badge variant="success">Verified</Badge>
                    : <Badge variant="warning">Pending</Badge>
              )
            },
            {
              key: "actions" as const,
              label: "Actions",
              render: (r: Profile) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      disabled={actionLoading === r.id}
                    >
                      {actionLoading === r.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="w-4 h-4" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => openEditDialog(r)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" />
                      Edit Role
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setResetTarget(r)}>
                      <KeyRound className="w-3.5 h-3.5 mr-2" />
                      Send Password Reset
                    </DropdownMenuItem>
                    {!r.is_verified && (
                      <DropdownMenuItem onClick={() => handleResendInvite(r)}>
                        <MailPlus className="w-3.5 h-3.5 mr-2" />
                        Resend Invitation
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDisableTarget(r)}>
                      {r.disabled ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 mr-2 text-green-600" />
                          <span className="text-green-600">Enable User</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-3.5 h-3.5 mr-2 text-amber-600" />
                          <span className="text-amber-600">Disable User</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteTarget(r)} className="text-destructive focus:text-destructive">
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]),
        ]}
        data={users}
        pageSize={10}
      />

      {/* Disable/Enable Confirmation */}
      <AlertDialog open={!!disableTarget} onOpenChange={(open) => !open && setDisableTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {disableTarget?.disabled ? "Enable User" : "Disable User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {disableTarget?.disabled
                ? `This will restore access for ${disableTarget?.email}. They will be able to log in again.`
                : `This will prevent ${disableTarget?.email} from logging in. Their data will be preserved and you can re-enable them later.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleDisable}
              className={disableTarget?.disabled ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}
            >
              {disableTarget?.disabled ? "Enable" : "Disable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.email}</strong> and all their associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Confirmation */}
      <AlertDialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              A password reset link will be sent to <strong>{resetTarget?.email}</strong>. The link will expire in 1 hour.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendPasswordReset}>
              Send Reset Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) { setEditTarget(null); setEditRole(""); setEditWarehouseId(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change role for {editTarget?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v) => { setEditRole(v as UserRole); setEditWarehouseId(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {allowedRoles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editNeedsWarehouse && !isWarehouseManager && (
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select value={editWarehouseId} onValueChange={setEditWarehouseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name} ({wh.short_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditTarget(null); setEditRole(""); setEditWarehouseId(""); }}>
              Cancel
            </Button>
            <Button
              onClick={handleEditRole}
              disabled={!editRole || (editNeedsWarehouse && !isWarehouseManager && !editWarehouseId) || actionLoading === editTarget?.id}
            >
              {actionLoading === editTarget?.id ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
