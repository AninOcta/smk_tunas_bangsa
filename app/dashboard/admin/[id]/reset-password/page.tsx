import ResetPasswordClient from "@/components/ResetPasswordClient";

interface ResetPasswordPageProps {
  params: Promise<{ id: string }>; // params sekarang Promise
}

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const resolvedParams = await params; // tunggu params resolve dulu

  return <ResetPasswordClient id={resolvedParams.id} />;
}
