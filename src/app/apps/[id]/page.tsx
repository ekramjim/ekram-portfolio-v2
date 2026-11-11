import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/Product";
import { PRODUCTS, productById } from "@/data/products";
import { PROJECTS } from "@/data/projects";

interface AppPageProps {
  params: Promise<{ id: string }>;
}

/** Only the apps with an in-depth page; any other id is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

const projectFor = (id: string) => PROJECTS.find((p) => p.id === id);

export async function generateMetadata({ params }: AppPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = productById(id);
  if (!product) return {};
  const title = `${product.name} — ${product.tagline.replace(/\.$/, "")}`;
  return {
    title,
    description: product.intro,
    alternates: { canonical: `/apps/${product.id}` },
    openGraph: { title, description: product.intro, url: `/apps/${product.id}`, ...(product.hero[0] ? { images: [product.hero[0].src] } : {}) },
  };
}

export default async function AppPage({ params }: AppPageProps) {
  const { id } = await params;
  const product = productById(id);
  const project = projectFor(id);
  if (!product || !project) notFound();
  const at = PRODUCTS.indexOf(product);
  const nextProduct = PRODUCTS[(at + 1) % PRODUCTS.length];
  const nextProject = projectFor(nextProduct.id);
  const next = nextProduct !== product && nextProject ? { product: nextProduct, project: nextProject } : undefined;
  return <ProductPage product={product} project={project} next={next} />;
}
