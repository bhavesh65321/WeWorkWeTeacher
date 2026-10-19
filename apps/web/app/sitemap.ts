import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gurumates.com";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type TutorMeta = { slug: string; updatedAt?: string };
type JobMeta = { id: string; updatedAt?: string };
type Meta = { subjects: string[]; cities: string[] };

async function fetchMeta(): Promise<Meta> {
  try {
    const res = await fetch(`${API}/api/tutors/meta`, { next: { revalidate: 3600 } });
    if (!res.ok) return { subjects: [], cities: [] };
    return res.json();
  } catch {
    return { subjects: [], cities: [] };
  }
}

async function fetchTutors(): Promise<TutorMeta[]> {
  try {
    const res = await fetch(`${API}/api/tutors?limit=500`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchJobs(): Promise<JobMeta[]> {
  try {
    const res = await fetch(`${API}/api/jobs?limit=500`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [meta, tutors, jobs] = await Promise.all([fetchMeta(), fetchTutors(), fetchJobs()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/tutors`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/jobs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refunds`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const tutorPages: MetadataRoute.Sitemap = tutors.map((t) => ({
    url: `${SITE_URL}/tutors/${t.slug}`,
    lastModified: t.updatedAt ? new Date(t.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const jobPages: MetadataRoute.Sitemap = jobs.map((j) => ({
    url: `${SITE_URL}/jobs/${j.id}`,
    lastModified: j.updatedAt ? new Date(j.updatedAt) : new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const subjectPages: MetadataRoute.Sitemap = meta.subjects.map((s) => ({
    url: `${SITE_URL}/subjects/${encodeURIComponent(s)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const cityPages: MetadataRoute.Sitemap = meta.cities.map((c) => ({
    url: `${SITE_URL}/locations/${encodeURIComponent(c)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...tutorPages, ...jobPages, ...subjectPages, ...cityPages];
}
