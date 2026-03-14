import { Skeleton } from "@/components/ui/skeleton";

export function PageTitleSkeleton({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div className="mb-6">
      <Skeleton className="h-7 w-40 mb-1.5" />
      {subtitle && <Skeleton className="h-4 w-64" />}
    </div>
  );
}

export function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="h-10 px-4 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="h-12 px-4">
                  <Skeleton className="h-3 w-24" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-7 w-16 mb-1" />
      <Skeleton className="h-2.5 w-20" />
    </div>
  );
}

export function DetailCardSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="bg-card border border-border rounded-md p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-2.5 w-16 mb-1.5" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-card border border-border rounded-md p-6">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoleCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-md p-5">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-3 w-full mb-3" />
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-40" />
        ))}
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-md p-6 max-w-lg">
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-2.5 w-20 mb-1.5" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
    </div>
  );
}

export function FilterBarSkeleton({ filters = 1 }: { filters?: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {Array.from({ length: filters }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-48 rounded-md" />
      ))}
    </div>
  );
}
