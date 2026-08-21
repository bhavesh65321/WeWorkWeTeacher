import { getMeta } from "@/lib/api";

export default async function Sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const meta = await getMeta().catch(() => ({ subjects: [] as string[], cities: [] as string[] }));
  const paths = [
    "",
    "/tutors",
    "/jobs",
    "/how-it-works",
    "/terms",
    "/privacy",
    "/refunds",
    "/support",
    ...meta.subjects.map((s) => `/subjects/${encodeURIComponent(s)}`),
    ...meta.cities.map((c) => `/locations/${encodeURIComponent(c)}`),
  ];
  return paths.map((path) => ({ url: `${base}${path}` }));
}
