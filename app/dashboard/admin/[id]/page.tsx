import AdminDashboardClient from "@/components/AdminDashboardClient";

interface AdminDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const resolvedParams = await params; // tunggu dulu params-nya

  return <AdminDashboardClient id={resolvedParams.id} />;
}
