"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle, UserPlus } from "lucide-react";
import { inviteUser, listWarehouses } from "@/lib/actions/auth";
import { UserRole, Warehouse } from "@/types/supabase";

interface CreateUserFormProps {
  currentUserRole?: UserRole;
  currentUserWarehouseId?: string | null;
}

const ROLE_OPTIONS: Record<UserRole, UserRole[]> = {
  "System Admin": ["System Admin", "Warehouse Manager", "Warehouse Staff", "Viewer"],
  "Warehouse Manager": ["Warehouse Staff", "Viewer"],
  "Warehouse Staff": [],
  "Viewer": [],
};

export default function CreateUserForm({ currentUserRole, currentUserWarehouseId }: CreateUserFormProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isWarehouseManager = currentUserRole === "Warehouse Manager";
  const allowedRoles = ROLE_OPTIONS[currentUserRole || "System Admin"];
  const needsWarehouse = role === "Warehouse Manager" || role === "Warehouse Staff";

  useEffect(() => {
    if (isWarehouseManager) return; // Warehouse managers can only assign their own warehouse
    const fetchWarehouses = async () => {
      const result = await listWarehouses();
      if (result.success && result.data) {
        setWarehouses(result.data);
      }
    };
    fetchWarehouses();
  }, [isWarehouseManager]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!role) {
      setError("Please select a role");
      setLoading(false);
      return;
    }

    if (needsWarehouse && !warehouseId) {
      setError("Please select a warehouse for this role");
      setLoading(false);
      return;
    }

    const effectiveWarehouseId = isWarehouseManager ? currentUserWarehouseId || undefined : (needsWarehouse ? warehouseId : undefined);
    const result = await inviteUser(email, fullName, role as UserRole, effectiveWarehouseId);

    if (result.success) {
      setSuccess("User invitation sent successfully! They will receive an email with setup instructions.");
      setEmail("");
      setFullName("");
      setRole("");
      setWarehouseId("");
    } else {
      setError(result.error || "Failed to invite user");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value) => { setRole(value as UserRole); setWarehouseId(""); }}>
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

        {needsWarehouse && !isWarehouseManager && (
          <div className="space-y-2">
            <Label htmlFor="warehouse">Assign Warehouse</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.length === 0 ? (
                  <SelectItem value="__none" disabled>No warehouses found — create one first</SelectItem>
                ) : (
                  warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name} ({wh.short_code})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          disabled={loading}
        >
          {loading ? "Sending invitation..." : "Send Invitation"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        The user will receive an email with a magic link to set up their password and access the system.
      </p>
    </div>
  );
}
