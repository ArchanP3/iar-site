import "server-only";
import { posts as codePosts, type Post } from "@/lib/blog";
import { publishedPosts, readMinutes } from "./content";
import { onThisSite } from "@/lib/site";

/* Blog cards for listings: the posts written in code plus the ones written in the CMS, newest first. */
export type PostCard = Pick<Post, "slug" | "title" | "description" | "date" | "minutes" | "tag" | "color" | "image">;

const COLORS = ["#C8102E", "#7C3AED", "#C81631", "#14B8A6", "#F59E0B", "#EC4899"];
const colorFor = (s: string) => COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];

export async function allPostCards(): Promise<PostCard[]> {
  const db = await publishedPosts();
  const codeSlugs = new Set(codePosts.map((p) => p.slug));
  const fromDb: PostCard[] = db
    .filter((p) => !codeSlugs.has(p.slug) && onThisSite(p.site))
    .map((p) => ({
      slug: p.slug, title: p.title, description: p.excerpt || p.seo_description || "", date: new Date(p.publish_at ?? p.created_at).toISOString().slice(0, 10),
      minutes: readMinutes(p.body), tag: p.category || "Guide", color: colorFor(p.category || p.slug), image: p.cover || "/hero/servo-drives.webp",
    }));
  return [...fromDb, ...codePosts].sort((a, b) => b.date.localeCompare(a.date));
}
