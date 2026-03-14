import { PageTitleSkeleton, TableSkeleton, FilterBarSkeleton } from '@/components/shared/Skeletons'

export default function LoadingMoveHistory() {
  return (
    <>
      <PageTitleSkeleton />
      <FilterBarSkeleton />
      <TableSkeleton columns={7} rows={8} />
    </>
  )
}
