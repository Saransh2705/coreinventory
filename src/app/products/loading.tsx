import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageTitleSkeleton, FilterBarSkeleton, TableSkeleton } from "@/components/shared/Skeletons";

export default function ProductsLoading() {
  return (
    <DashboardLayout>
      <PageTitleSkeleton />
      <FilterBarSkeleton filters={3} />
      <TableSkeleton columns={9} rows={8} />
    </DashboardLayout>
  );
}
