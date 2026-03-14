import { getWarehouses } from "@/lib/actions/warehouses";
import { getCurrentUser } from "@/lib/actions/auth";
import WarehousesClient from "@/components/warehouses/WarehousesClient";

export default async function WarehousesPage() {
  const [whResult, user] = await Promise.all([getWarehouses(), getCurrentUser()]);

  const warehouses = whResult.success && whResult.data ? whResult.data : [];
  const isAdmin = user?.role === "System Admin";

  return (
    <WarehousesClient
      initialWarehouses={warehouses}
      isAdmin={isAdmin}
    />
  );
}
