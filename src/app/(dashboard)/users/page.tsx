import { getCurrentUser, listUsers } from "@/lib/actions/auth";
import { Profile } from "@/types/supabase";
import UsersClient from "@/components/users/UsersClient";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const [user, usersResult] = await Promise.all([
    getCurrentUser(),
    listUsers(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const users = (usersResult.success && usersResult.data
    ? usersResult.data.filter((u) => u.role !== "System Admin")
    : []) as Profile[];

  return (
    <UsersClient
      initialUsers={users}
      currentUser={user as Profile}
    />
  );
}
