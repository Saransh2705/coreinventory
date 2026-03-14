import { PageTitleSkeleton, FilterBarSkeleton, TableSkeleton } from "@/components/shared/Skeletons";

export default function ProductsLoading() {
  return (
    <>
      <PageTitleSkeleton />
      <FilterBarSkeleton filters={3} />
      <TableSkeleton columns={9} rows={8} />
    </>
  );
}
