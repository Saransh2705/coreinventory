import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageTitleSkeleton, TableSkeleton } from "@/components/shared/Skeletons";

export default function UsersLoading() {
  return (
    <DashboardLayout>
      <PageTitleSkeleton />
      <TableSkeleton columns={6} rows={5} />
    </DashboardLayout>
  );
}
