import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Database, ExternalLink, Globe2, Lock, Package, Search, Settings2, TriangleAlert } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { readSetting } from "@/lib/cms/settings";
import { countIndexableParts, listParts, partUrl } from "@/lib/parts/repository";
import { partVars } from "@/lib/parts/seo";
import { Alert, Card, PageHead, b, cx } from "@/components/admin/ui";
import { categoryOptions, countEdited, countLowPrice, listProducts } from "@/lib/cms/products";
import { getCategory } from "@/lib/parts/categories";
import { MinPricesForm } from "@/components/admin/ProductForms";
import { PartsTable, SlashFocus } from "@/components/admin/PartsTable";
import PartsSeoForm from "@/components/admin/PartsSeoForm";

type Tab = "all" | "price" | "edited" | "google" | "settings";
const TABS: Tab[] = ["all", "price", "edited", "google", "settings"];
type Props = { searchParams: Promise<{ q?: string; page?: string; cat?: string; tab?: string; low?: string }> };

export default function Page(props: Props) {
  return (
    <Suspense fallback={<p className="text-[#8494AB]">Loading…</p>}>
      <Parts {...props} />
    </Suspense>
  );
}

async function Parts({ searchParams }: Props) {
  const user = await requireUser("parts");
  const isAdmin = user.role === "owner" || user.role === "admin";
  const sp = await searchParams;
  // Old links used ?low=1 for the Low price list; they open the Price check tab now.
  const tab: Tab = TABS.includes(sp.tab as Tab) ? (sp.tab as Tab) : sp.low === "1" ? "price" : "all";
  const listTab = tab === "all" || tab === "price" || tab === "edited";
  const page = Math.max(1, Number(sp.page) || 1);
  const cat = sp.cat === "none" || getCategory(sp.cat) ? sp.cat : undefined;
  const q = (sp.q ?? "").trim() || undefined;
  const mins = await readSetting("partsMinPrice");
  const hasMins = Object.keys(mins).length > 0;
  const [cfg, list, indexable, lowCount, editedCount, rows] = await Promise.all([
    readSetting("partsSeo"),
    listParts({ page: 1 }),
    countIndexableParts().catch(() => 0),
    countLowPrice(mins).catch(() => 0),
    countEdited().catch(() => 0),
    listTab ? listProducts({ q, page, cat, low: tab === "price", edited: tab === "edited", mins }) : null,
  ]);

  /** Link to this page with some of tab / search / category / page changed. */
  const href = (next: { tab?: Tab; q?: string; cat?: string; page?: number }) => {
    const v = { tab, q, cat, page: 1, ...next };
    const u = new URLSearchParams();
    if (v.tab !== "all") u.set("tab", v.tab);
    if (v.q) u.set("q", v.q);
    if (v.cat) u.set("cat", v.cat);
    if (v.page > 1) u.set("page", String(v.page));
    const s = u.toString();
    return s ? `?${s}` : "/admin/parts";
  };

  const tabs: { key: Tab; label: string; icon: ReactNode; count?: number; tone?: "red" | "amber" }[] = [
    { key: "all", label: "All parts", icon: <Package size={15} />, count: list.total },
    { key: "price", label: "Price check", icon: <TriangleAlert size={15} />, count: hasMins ? lowCount : undefined, tone: "red" },
    { key: "edited", label: "Edited in CMS", icon: <Lock size={15} />, count: editedCount, tone: "amber" },
    { key: "google", label: "Google listing", icon: <Globe2 size={15} /> },
    { key: "settings", label: "Import & info", icon: <Settings2 size={15} /> },
  ];
  const countTone = (t: (typeof tabs)[number], on: boolean) =>
    on ? "bg-white/18 text-white" : t.tone === "red" && t.count ? "bg-[#FEF3F2] text-[#B42318]" : t.tone === "amber" && t.count ? "bg-[#FFFAEB] text-[#B45309]" : "bg-[#EEF3F9] text-[#5B6B84]";

  const samples = list.items.slice(0, 3).map((p) => ({ label: `${p.manufacturer} ${p.partNumber}`, vars: partVars(p) }));
  const filtered = Boolean(q || cat);
  const empty =
    tab === "price" ? (filtered ? "No low-price listings match this search." : "Nothing to check: every listing is at or above its category minimum.")
    : tab === "edited" ? (filtered ? "No edited listings match this search." : "No listings have been edited in the CMS yet.")
    : q ? `No parts match “${q}”.` : "No parts in this category.";

  const listCard = rows && (
    <Card pad={false} className="overflow-hidden">
      {/* Category chips */}
      <nav aria-label="Category" className="flex gap-1.5 overflow-x-auto border-b border-[#E3EAF3] px-4 py-2.5 text-[12.5px] [scrollbar-width:none]">
        {[{ slug: undefined as string | undefined, name: "All categories" }, ...categoryOptions, { slug: "none", name: "No category" }].map((c) => {
          const on = cat === c.slug;
          return (
            <Link key={c.slug ?? "all"} href={href({ cat: c.slug })} aria-current={on ? "true" : undefined} className={cx("shrink-0 whitespace-nowrap rounded-full border px-3 py-1 font-semibold transition", on ? "border-[#0B1A3C] bg-[#0B1A3C] text-white" : "border-[#E3EAF3] bg-white text-[#5B6B84] hover:border-[#0066FF] hover:text-[#0052CC]")}>
              {c.name}
            </Link>
          );
        })}
      </nav>
      {tab === "price" && (
        <div className="border-b border-[#E3EAF3] bg-[#FFFBFA] px-4 py-2.5 text-[12.5px] text-[#7A271A]">
          Listings priced under their category&apos;s minimum, cheapest first. They may be typos: click a price to fix it.
        </div>
      )}
      {tab === "edited" && (
        <div className="border-b border-[#E3EAF3] bg-[#FFFDF5] px-4 py-2.5 text-[12.5px] text-[#7A2E0E]">
          Fields changed here are <Lock size={11} className="inline text-[#B45309]" /> locked, so imports won&apos;t overwrite them. Unlock a field to let imports update it again.
        </div>
      )}
      <PartsTable
        rows={rows.items.map((p) => ({
          id: p.id,
          label: `${p.manufacturer ?? ""} ${p.part_number}`.trim(),
          brand: p.manufacturer,
          partNumber: p.part_number,
          title: p.title,
          category: (p.category_slug && getCategory(p.category_slug)?.name) || p.category,
          categorySlug: p.category_slug,
          price: p.price,
          display: p.price_display,
          status: p.status,
          locked: p.cms_locked,
          url: partUrl(p.slug),
        }))}
        cats={categoryOptions}
        mins={mins}
        canBulkPrice={isAdmin}
        empty={empty}
        showLocks={tab === "edited"}
      />
      <div className="flex flex-wrap items-center gap-3 border-t border-[#E3EAF3] px-4 py-3 text-[12.5px] text-[#5B6B84]">
        <span className="font-semibold text-[#0B1A3C]">Page {page}</span>
        {page > 1 && <Link href={href({ page: page - 1 })} className={b("light", true)}>Previous</Link>}
        {rows.hasNext && <Link href={href({ page: page + 1 })} className={b("light", true)}>Next</Link>}
        <span className="ml-auto max-sm:w-full">Click a price to change it. Tick rows to change {isAdmin ? "prices or categories" : "categories"} together.</span>
      </div>
    </Card>
  );

  return (
    <>
      <SlashFocus target="parts-q" />
      <PageHead
        crumb={<><span>CMS</span><span>/</span><span className="text-[#5B6B84]">Parts Catalog</span></>}
        title="Parts Catalog"
        sub={<>{list.total.toLocaleString()} part pages on .com and .ca · {indexable.toLocaleString()} in the parts sitemaps</>}
        actions={<a href="/shop" target="_blank" rel="noopener" className={b("light")}><ExternalLink size={14} /> View shop</a>}
      />

      {/* Search: works on every list tab and keeps the tab and category */}
      <form action="/admin/parts" className="flex flex-col gap-2 sm:flex-row">
        {tab !== "all" && listTab && <input type="hidden" name="tab" value={tab} />}
        {cat && listTab && <input type="hidden" name="cat" value={cat} />}
        <label className="relative flex-1">
          <span className="sr-only">Search parts</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8494AB]" />
          <input
            id="parts-q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Search part number, brand or title"
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-[#D9E3EF] bg-white pl-11 pr-14 text-[14.5px] font-medium text-[#0B1A3C] shadow-[0_1px_2px_rgba(11,26,60,0.05)] outline-none transition placeholder:text-[#8494AB] focus:border-[#0066FF] focus:ring-4 focus:ring-[#0066FF]/12"
          />
          <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 grid h-6 min-w-6 place-items-center rounded-md border border-[#E3EAF3] bg-[#F7FAFD] px-1.5 text-[11.5px] font-bold text-[#8494AB] max-sm:hidden">/</kbd>
        </label>
        <button className={cx(b("dark"), "h-12! px-6")}>Search</button>
        {filtered && listTab && <Link href={href({ q: "", cat: "" })} className={cx(b("light"), "h-12!")}>Clear</Link>}
      </form>

      {/* Tabs */}
      <nav aria-label="Parts Catalog sections" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {tabs.map((t) => {
          const on = t.key === tab;
          return (
            <Link
              key={t.key}
              href={t.key === "google" || t.key === "settings" ? href({ tab: t.key, q: "", cat: "" }) : href({ tab: t.key })}
              aria-current={on ? "page" : undefined}
              className={cx(
                "inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 text-[13px] font-bold transition",
                on ? "bg-[#0B1A3C] text-white shadow-[0_10px_24px_-14px_rgba(11,26,60,0.9)]" : "text-[#5B6B84] hover:bg-white hover:text-[#0B1A3C]",
              )}
            >
              <span className={on ? "text-[#7CC4FF]" : "text-[#8494AB]"}>{t.icon}</span>
              {t.label}
              {t.count != null && <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums", countTone(t, on))}>{t.count.toLocaleString()}</span>}
            </Link>
          );
        })}
      </nav>

      {tab === "all" && listCard}

      {tab === "edited" && listCard}

      {tab === "price" &&
        (hasMins ? (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            {listCard}
            {isAdmin ? (
              <Card title="Minimum price per category" icon={<TriangleAlert size={16} />}>
                <p className="mb-3 text-[12.5px] text-[#5B6B84]">Listings under these go on the Price check list. Leave empty for no minimum.</p>
                <MinPricesForm cats={categoryOptions} mins={mins} />
              </Card>
            ) : (
              <Alert tone="blue" icon={<TriangleAlert size={16} />}>An Admin sets the minimum price for each category.</Alert>
            )}
          </div>
        ) : isAdmin ? (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Card>
              <div className="flex flex-col items-start gap-2">
                <TriangleAlert size={22} className="text-[#B42318]" />
                <h2 className="text-[16px] font-extrabold">Catch prices that look wrong</h2>
                <p className="text-[13px] text-[#5B6B84]">Set a minimum price for each category. Any listing priced under it shows up here, cheapest first, so typos like $12 instead of $1,200 are easy to spot.</p>
              </div>
            </Card>
            <Card title="Minimum price per category" icon={<TriangleAlert size={16} />}>
              <MinPricesForm cats={categoryOptions} mins={mins} />
            </Card>
          </div>
        ) : (
          <Alert tone="blue" icon={<TriangleAlert size={16} />}>The Price check list turns on once an Admin sets minimum prices.</Alert>
        ))}

      {tab === "google" && <PartsSeoForm cfg={cfg} samples={samples} />}

      {tab === "settings" && (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <Card><div className="flex items-center gap-3"><Package size={22} className="text-[#0066FF]" /><div><div className="text-[24px] font-extrabold">{list.total.toLocaleString()}</div><div className="text-[12.5px] text-[#5B6B84]">part pages</div></div></div></Card>
            <Card><div className="flex items-center gap-3"><Search size={22} className="text-[#12B76A]" /><div><div className="text-[24px] font-extrabold">{indexable.toLocaleString()}</div><div className="text-[12.5px] text-[#5B6B84]">in the parts sitemaps</div></div></div></Card>
            <Card><div className="flex items-center gap-3"><Database size={22} className="text-[#7C3AED]" /><div><div className="text-[15px] font-extrabold">Supabase catalog</div><div className="text-[12.5px] text-[#5B6B84]">Bulk import, plus edits here</div></div></div></Card>
          </div>
          <Alert tone="blue" icon={<Database size={16} />}>Part numbers are imported in bulk by your developer. Prices, stock and details can be changed here: a changed field is locked, so the next import keeps your change. Use Unlock on the edit page or the Edited in CMS tab to let imports update it again.</Alert>
        </>
      )}
    </>
  );
}
