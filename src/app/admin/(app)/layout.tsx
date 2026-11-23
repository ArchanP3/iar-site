import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, Search } from "lucide-react";
import Sidebar, { type NavGroup } from "@/components/admin/Sidebar";
import { redirect } from "next/navigation";
import { can, currentUser, roleLabel, type User } from "@/lib/cms/auth";
import { one } from "@/lib/cms/db";
import { LEADS } from "@/lib/cms/leads";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <Frame>{children}</Frame>
    </Suspense>
  );
}

function Loading() {
  return <div className="flex min-h-screen items-center justify-center text-[#8494AB]">Loading…</div>;
}

async function counts(u: User) {
  const r = await one<{ leads: number; noalt: number; issues: number; nf: number }>(
    `SELECT
       ${can(u.role, "leads") ? `(SELECT count(*)::int FROM (${LEADS}) l WHERE status = 'new')` : "0"} AS leads,
       (SELECT count(*)::int FROM cms.cms_media WHERE alt = '') AS noalt,
       COALESCE((SELECT (summary->>'issues')::int FROM cms.cms_audit_runs WHERE finished_at IS NOT NULL ORDER BY id DESC LIMIT 1), 0) AS issues,
       (SELECT count(*)::int FROM cms.cms_404 WHERE NOT ignored AND last_seen > now() - interval '30 days' AND path NOT IN (SELECT from_path FROM cms.cms_redirects)) AS nf`,
  ).catch(() => null);
  return r ?? { leads: 0, noalt: 0, issues: 0, nf: 0 };
}

async function Frame({ children }: { children: React.ReactNode }) {
  // Each screen checks its own access; the frame only needs a signed-in person (the Account screen must work before 2-step/password setup).
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  const c = await counts(u);
  const all: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: "dashboard" },
        ...(can(u.role, "checklist") ? [{ href: "/admin/checklist", label: "Weekly checklist", icon: "checklist" as const }] : []),
      ],
    },
    {
      label: "Content",
      items: [
        ...(can(u.role, "pages") ? [{ href: "/admin/pages", label: "Pages", icon: "pages" as const }] : []),
        ...(can(u.role, "blog") ? [{ href: "/admin/blog", label: "Blog", icon: "blog" as const }] : []),
        ...(can(u.role, "landing") ? [{ href: "/admin/landing", label: "Landing Pages", icon: "landing" as const }] : []),
        ...(can(u.role, "parts") ? [{ href: "/admin/parts", label: "Parts Catalog", icon: "parts" as const }] : []),
        ...(can(u.role, "media") ? [{ href: "/admin/media", label: "Media Library", icon: "media" as const, badge: c.noalt, badgeTone: "red" as const }] : []),
      ],
    },
    {
      label: "SEO",
      items: [
        ...(can(u.role, "audit") ? [{ href: "/admin/audit", label: "SEO Audit", icon: "audit" as const, badge: c.issues, badgeTone: "dim" as const }] : []),
        ...(can(u.role, "redirects") ? [{ href: "/admin/redirects", label: "Redirects & 404s", icon: "redirects" as const, badge: c.nf, badgeTone: "red" as const }] : []),
        ...(can(u.role, "schema") ? [{ href: "/admin/schema", label: "Schema", icon: "schema" as const }] : []),
        ...(can(u.role, "sitemaps") ? [{ href: "/admin/sitemaps", label: "Sitemaps & Robots", icon: "sitemaps" as const }] : []),
        ...(can(u.role, "locations") ? [{ href: "/admin/locations", label: "Locations", icon: "locations" as const }] : []),
      ],
    },
    {
      label: "Growth",
      items: [
        ...(can(u.role, "performance") ? [{ href: "/admin/performance", label: "Search Performance", icon: "performance" as const }] : []),
        ...(can(u.role, "leads") ? [{ href: "/admin/leads", label: "Leads", icon: "leads" as const, badge: c.leads, badgeTone: "red" as const }] : []),
      ],
    },
    {
      label: "Settings",
      items: [
        ...(can(u.role, "tracking") ? [{ href: "/admin/tracking", label: "Tracking & Code", icon: "tracking" as const }] : []),
        ...(can(u.role, "settings") ? [{ href: "/admin/settings", label: "Site Settings", icon: "settings" as const }] : []),
        ...(can(u.role, "activity") ? [{ href: "/admin/users", label: can(u.role, "users") ? "Users & Activity" : "Activity", icon: "users" as const }] : []),
      ],
    },
  ];
  const groups = all.filter((g) => g.items.length);
  const initials = u.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <Sidebar groups={groups} user={{ name: u.name, role: roleLabel[u.role] }} />
      <main className="min-w-0">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E3EAF3] bg-white/95 pl-16 pr-4 backdrop-blur sm:pr-7 lg:pl-7">
          <form action="/admin/search" className="flex h-10 min-w-0 max-w-130 flex-1 items-center gap-2.5 rounded-[11px] border border-[#E3EAF3] bg-[#F8FAFD] px-3.5 text-[#8494AB] focus-within:border-[#0066FF]">
            <Search size={16} />
            <input name="q" placeholder="Search pages, posts, redirects…" className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] text-[#0B1A3C] outline-none placeholder:text-[#8494AB]" />
          </form>
          <div className="flex-1" />
          <Link href="/" target="_blank" className="hidden items-center gap-1.5 text-[13px] font-semibold text-[#0B1A3C] hover:text-[#0052CC] sm:inline-flex"><ExternalLink size={15} /> View site</Link>
          <Link href="/admin/account" className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#0066FF] to-[#00B0FF] text-[12px] font-bold text-white" title="My account">{initials}</Link>
        </div>
        <div className="flex flex-col gap-5 px-4 pb-10 pt-6 sm:px-7">{children}</div>
      </main>
    </div>
  );
}
