"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  children?: ReactNode;
}

const PageHeader = ({ title, subtitle, action, onAction, children }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children ? (
        <div>{children}</div>
      ) : action ? (
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button onClick={onAction} className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 px-4 text-sm font-medium gap-2">
            <Plus className="w-4 h-4" />
            {action}
          </Button>
        </motion.div>
      ) : null}
    </div>
  );
};

export default PageHeader;
