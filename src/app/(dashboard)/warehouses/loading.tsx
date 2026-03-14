import { PageTitleSkeleton, TableSkeleton } from "@/components/shared/Skeletons";

export default function WarehousesLoading() {
  return (
    <>
      <PageTitleSkeleton />
      <TableSkeleton columns={5} rows={5} />
    </>
  );
}
