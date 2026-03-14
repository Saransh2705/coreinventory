"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { createWarehouse } from "@/lib/actions/warehouses";

interface CreateWarehouseFormProps {
  onSuccess?: () => void;
}

export default function CreateWarehouseForm({ onSuccess }: CreateWarehouseFormProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await createWarehouse(name, address || undefined);

    if (result.success) {
      setSuccess("Warehouse created successfully!");
      setName("");
      setAddress("");
      onSuccess?.();
    } else {
      setError(result.error || "Failed to create warehouse");
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
          <Label htmlFor="name">Warehouse Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Central Distribution Hub"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            placeholder="123 Industrial Ave, Chicago"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Warehouse"}
        </Button>
      </form>
    </div>
  );
}
