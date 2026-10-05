import { notFound } from "next/navigation";
import AdminPageConfigurator from "@/components/admin/admin-page-configurator";
import { getContentPage } from "@/lib/content-repository";

export default async function AdminContentConfiguratorPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: slug } = await params;
  const page = await getContentPage(slug, true);

  if (!page) notFound();

  return <AdminPageConfigurator page={page} />;
}
