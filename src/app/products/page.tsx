import { getProducts, getCategories } from "@/lib/actions/products";
import { getCurrentUser } from "@/lib/actions/auth";
import ProductsClient, { ProductRow } from "@/components/products/ProductsClient";

export default async function ProductsPage() {
  const [prodResult, categories, user] = await Promise.all([
    getProducts(),
    getCategories(),
    getCurrentUser(),
  ]);

  const products = (prodResult.success && prodResult.data ? prodResult.data : []) as ProductRow[];
  const isAdmin = user?.role === "System Admin";

  return (
    <ProductsClient
      initialProducts={products}
      initialCategories={categories}
      isAdmin={isAdmin}
    />
  );
}
