"use client";

import { useState, useEffect } from "react";
import { Search, Bell, ChevronDown, LogOut, User, Package } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { logout } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/client";
import ThemePicker from "./ThemePicker";

const TopNav = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; full_name?: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', authUser.id)
          .single();
        
        setUser({
          email: authUser.email || '',
          full_name: (profile as { full_name: string | null } | null)?.full_name || authUser.email?.split('@')[0] || 'User'
        });
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-md border-b border-border z-50 flex items-center px-4 gap-4 print:hidden">
      {/* Logo */}
      <div className="flex items-center gap-2 w-[240px] shrink-0">
        <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center">
          <Package className="w-4 h-4 text-accent-foreground" />
        </div>
        <span className="text-sm font-semibold text-foreground tracking-tight">CoreInventory</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, SKUs, receipts... (⌘K)"
            className="w-full h-9 pl-9 pr-4 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 ml-auto">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </motion.button>

        {/* Theme Picker */}
        <ThemePicker />

        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="font-medium text-foreground">{user?.full_name || 'User'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50 py-1">
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors">
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
