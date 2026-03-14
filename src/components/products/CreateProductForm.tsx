"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { createProduct } from "@/lib/actions/products";

interface CreateProductFormProps {
  onSuccess?: () => void;
}

export default function CreateProductForm({ onSuccess }: CreateProductFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [reorderLevel, setReorderLevel] = useState(0);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!category.trim()) {
      setError("Category is required");
      return;
    }

    setLoading(true);

    const result = await createProduct({
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim() || "pcs",
      reorder_level: reorderLevel,
      description: description.trim() || undefined,
    });

    if (result.success) {
      setSuccess("Product created! SKU and short code generated automatically.");
      setName("");
      setCategory("");
      setUnit("pcs");
      setReorderLevel(0);
      setDescription("");
      onSuccess?.();
    } else {
      setError(result.error || "Failed to create product");
    }

    setLoading(false);
  };

  const units = ["pcs", "kg", "m", "L", "units", "boxes", "rolls"];

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
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Industrial Compressor V2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Machinery"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reorderLevel">Reorder Level</Label>
          <Input
            id="reorderLevel"
            type="number"
            min={0}
            value={reorderLevel}
            onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">Products below this stock level will be marked as "Low Stock"</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief product description..."
            rows={3}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Short Code (PRD-XXX) and SKU (SKU-XXXX) will be generated automatically.
        </p>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {loading ? "Creating..." : "Create Product"}
        </Button>
      </form>
    </div>
  );
}
