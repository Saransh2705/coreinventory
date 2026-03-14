import DashboardLayout from '@/components/layout/DashboardLayout'
import { PageTitleSkeleton, KPICardSkeleton, TableSkeleton } from '@/components/shared/Skeletons'

export default function LoadingDashboard() {
  return (
    <DashboardLayout>
      <PageTitleSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 8 }).map((_, i) => <KPICardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TableSkeleton columns={6} rows={5} />
        <TableSkeleton columns={6} rows={5} />
      </div>
      <TableSkeleton columns={5} rows={5} />
    </DashboardLayout>
  )
}
