import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExternalLink, Lock } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { FIELD_LABEL, categoryOptions, getProductRow } from "@/lib/cms/products";
import { getCategory } from "@/lib/parts/categories";
import { partUrl } from "@/lib/parts/repository";
import { Alert, Card, PageHead, Pill, b } from "@/components/admin/ui";
import { LockMark, ProductEditor } from "@/components/admin/ProductForms";

type Props = { searchParams: Promise<{ id?: string }> };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#91919E]">Loading…</p>}>
      <Edit {...props} />
    </Suspense>
  );
}

async function Edit({ searchParams }: Props) {
  await requireUser("parts");
  const id = Number((await searchParams).id);
  const p = id > 0 ? await getProductRow(id) : null;
  if (!p) notFound();
  // Locks on fields this screen doesn't edit yet (e.g. photos, brand) can still be undone.
  const other = p.cms_locked.filter((f) => !["title", "description", "sku", "price", "price_display", "condition", "availability", "stock_qty", "warranty", "ebay_item_id", "tab_specifications", "category"].includes(f));
  return (
    <>
      <PageHead
        crumb={<><Link href="/admin/parts" className="hover:text-[#A50D25]">Parts Catalog</Link><span>/</span><span>Edit</span></>}
        title={<span className="font-mono">{p.manufacturer} {p.part_number}</span>}
        sub={<>{(p.category_slug && getCategory(p.category_slug)?.name) || p.category || "No category"} · {p.status === "published" ? <Pill tone="ok">Published</Pill> : p.status === "draft" ? <Pill tone="warn">Draft</Pill> : <Pill>Hidden</Pill>}</>}
        actions={<a href={partUrl(p.slug)} target="_blank" rel="noopener" className={b("light")}><ExternalLink size={15} /> View on site</a>}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card title="Product details">
          <ProductEditor
            p={{
              id: p.id, title: p.title, description: p.description, sku: p.sku, price: p.price, condition: p.condition, availability: p.availability,
              stock_qty: p.stock_qty, warranty: p.warranty, ebay_item_id: p.ebay_item_id, tab_specifications: p.tab_specifications,
              category: p.category, category_slug: p.category_slug, cms_locked: p.cms_locked,
            }}
            cats={categoryOptions}
          />
        </Card>
        <div className="flex flex-col gap-5">
          <Card title="Locked against imports" icon={<Lock size={16} />}>
            {p.cms_locked.length ? (
              <ul className="flex flex-col gap-2 text-[13px]">
                {p.cms_locked.filter((f) => f !== "price_display").map((f) => (
                  <li key={f} className="flex items-center justify-between gap-2"><span className="font-semibold">{FIELD_LABEL[f] ?? f}</span>{other.includes(f) && <LockMark id={p.id} field={f} />}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-[#696976]">Nothing yet. Any field you change here gets locked, so the CSV and catalog imports keep your version.</p>
            )}
          </Card>
          <Alert tone="blue">Changes show on the live site straight away, and every change is in Users &amp; Activity with Undo.</Alert>
          <div className="text-[12px] text-[#91919E]">Part number, brand and photos can&apos;t be changed here yet.</div>
        </div>
      </div>
    </>
  );
}
