import DashboardLayout from '@/components/layout/DashboardLayout'
import { PageTitleSkeleton, TableSkeleton } from '@/components/shared/Skeletons'

export default function LoadingAdjustments() {
  return (
    <DashboardLayout>
      <PageTitleSkeleton />
      <TableSkeleton columns={7} rows={8} />
    </DashboardLayout>
  )
}
