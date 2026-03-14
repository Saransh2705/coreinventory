import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageTitleSkeleton, TableSkeleton } from "@/components/shared/Skeletons";

export default function WarehousesLoading() {
  return (
    <DashboardLayout>
      <PageTitleSkeleton />
      <TableSkeleton columns={5} rows={5} />
    </DashboardLayout>
  );
}
