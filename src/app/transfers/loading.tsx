import DashboardLayout from '@/components/layout/DashboardLayout'
import { PageTitleSkeleton, TableSkeleton, FilterBarSkeleton } from '@/components/shared/Skeletons'

export default function LoadingTransfers() {
  return (
    <DashboardLayout>
      <PageTitleSkeleton />
      <FilterBarSkeleton />
      <TableSkeleton columns={7} rows={8} />
    </DashboardLayout>
  )
}
