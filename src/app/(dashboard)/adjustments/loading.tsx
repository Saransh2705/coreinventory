import { PageTitleSkeleton, TableSkeleton } from '@/components/shared/Skeletons'

export default function LoadingAdjustments() {
  return (
    <>
      <PageTitleSkeleton />
      <TableSkeleton columns={7} rows={8} />
    </>
  )
}
