export default async function Page({
  params,
}: {
  params: Promise<{ aboutId: string }>;
}) {
  const { aboutId } = await params;

  return <>{aboutId}</>;
}
