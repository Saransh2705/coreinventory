"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { logout } from "@/app/login/actions";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Truck,
  ArrowLeftRight,
  ClipboardCheck,
  History,
  BarChart3,
  Building2,
  MapPin,
  Users,
  Shield,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; icon: React.ElementType; path: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Products", icon: Package, path: "/products" },
  {
    label: "Operations",
    icon: ClipboardList,
    children: [
      { label: "Receipts", icon: ClipboardList, path: "/receipts" },
      { label: "Deliveries", icon: Truck, path: "/deliveries" },
      { label: "Internal Transfers", icon: ArrowLeftRight, path: "/transfers" },
      { label: "Adjustments", icon: ClipboardCheck, path: "/adjustments" },
      { label: "Move History", icon: History, path: "/move-history" },
    ],
  },
  {
    label: "Inventory",
    icon: BarChart3,
    children: [
      { label: "Stock Overview", icon: BarChart3, path: "/stock-overview" },
    ],
  },
  {
    label: "Infrastructure",
    icon: Building2,
    children: [
      { label: "Warehouses", icon: Building2, path: "/warehouses" },
      { label: "Locations", icon: MapPin, path: "/locations" },
    ],
  },
  {
    label: "Administration",
    icon: Users,
    children: [
      { label: "Users", icon: Users, path: "/users" },
      { label: "Roles", icon: Shield, path: "/roles" },
    ],
  },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Operations", "Inventory", "Infrastructure", "Administration"]);

  const isActive = (path: string) => pathname === path;
  const isGroupActive = (item: NavItem) => item.children?.some((c) => pathname === c.path);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-[240px] bg-card border-r border-border z-40 flex flex-col">
      <nav className="py-3 px-3 flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.path) {
            return (
              <Link key={item.label} href={item.path}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                    isActive(item.path)
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          }

          const isExpanded = expandedGroups.includes(item.label);
          const groupActive = isGroupActive(item);

          return (
            <div key={item.label} className="mt-1">
              <button
                onClick={() => toggleGroup(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                  groupActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
                <span className="font-medium">{item.label}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 ml-auto transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                />
              </button>
              {isExpanded && (
                <div className="ml-4 pl-4 border-l border-border flex flex-col gap-0.5 mt-0.5">
                  {item.children!.map((child) => (
                    <Link key={child.label} href={child.path}>
                      <motion.div
                        whileHover={{ x: 2 }}
                        className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                          isActive(child.path)
                            ? "bg-accent/10 text-accent font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <child.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                        <span>{child.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-3 border-t border-border">
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <span className="font-medium">Logout</span>
          <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
