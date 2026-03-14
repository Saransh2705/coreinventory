import { PageTitleSkeleton, TableSkeleton } from "@/components/shared/Skeletons";

export default function UsersLoading() {
  return (
    <>
      <PageTitleSkeleton />
      <TableSkeleton columns={6} rows={5} />
    </>
  );
}
