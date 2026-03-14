import DashboardLayout from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailCardSkeleton, TableSkeleton } from "@/components/shared/Skeletons";

export default function ProductDetailLoading() {
  return (
    <DashboardLayout>
      <Skeleton className="h-4 w-32 mb-4" />
      <DetailCardSkeleton fields={8} />
      <Skeleton className="h-5 w-36 mt-6 mb-3" />
      <TableSkeleton columns={5} rows={5} />
    </DashboardLayout>
  );
}
