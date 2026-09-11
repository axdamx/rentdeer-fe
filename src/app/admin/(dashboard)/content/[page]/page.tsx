import { notFound } from "next/navigation";
import AdminPageConfigurator from "@/components/admin/admin-page-configurator";
import { adminContentPages, getAdminContentPage } from "@/lib/admin-mock-data";

export function generateStaticParams() {
  return adminContentPages.map((page) => ({ page: page.slug }));
}

export default async function AdminContentConfiguratorPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: slug } = await params;
  const page = getAdminContentPage(slug);

  if (!page) notFound();

  return <AdminPageConfigurator page={page} />;
}
