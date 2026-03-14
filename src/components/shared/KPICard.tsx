import { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendColor?: "success" | "destructive" | "muted";
}

const KPICard = ({ label, value, icon: Icon, trend, trendColor = "muted" }: KPICardProps) => {
  const trendClasses = {
    success: "text-success",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
  };

  return (
    <div className="p-5 bg-card border border-border rounded-md">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</span>
            {trend && <span className={`text-xs font-medium ${trendClasses[trendColor]}`}>{trend}</span>}
          </div>
        </div>
        <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
