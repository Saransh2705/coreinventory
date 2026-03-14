import { PageTitleSkeleton, TableSkeleton, FilterBarSkeleton } from '@/components/shared/Skeletons'

export default function LoadingTransfers() {
  return (
    <>
      <PageTitleSkeleton />
      <FilterBarSkeleton />
      <TableSkeleton columns={7} rows={8} />
    </>
  )
}
