"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/");
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

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-9 text-sm font-medium">
                Login
              </Button>
            </motion.div>
            <a href="#" className="text-xs text-accent hover:underline text-center">Forgot Password?</a>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
