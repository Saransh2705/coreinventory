"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, AlertCircle } from "lucide-react";
import { login } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Redirect will be handled by server action
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="bg-card border border-border rounded-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">CoreInventory</h1>
            <p className="text-xs text-muted-foreground mt-1">Enterprise Inventory Management</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-foreground mb-1.5 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                required
                className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs font-medium text-foreground mb-1.5 block">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm"
              />
            </div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button 
                type="submit" 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-9 text-sm font-medium"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </motion.div>
          </form>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
