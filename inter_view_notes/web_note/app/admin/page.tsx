import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AdminPanel } from "@/components/admin-panel";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/auth");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="wrap">
      <AdminPanel adminEmail={user.email} />
    </div>
  );
}
