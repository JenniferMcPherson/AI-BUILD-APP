import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, articles, creators] = await Promise.all([
    db.project.findMany({
      where: { listedInMarketplace: true },
      select: { slug: true, updatedAt: true },
    }),
    db.article.findMany({ select: { slug: true, updatedAt: true } }),
    db.user.findMany({
      where: { username: { not: null } },
      select: { username: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/discover`, changeFrequency: "daily", priority: 0.7 },
    { url: `${APP_URL}/marketplace`, changeFrequency: "daily", priority: 0.7 },
    { url: `${APP_URL}/library`, changeFrequency: "daily", priority: 0.7 },
    { url: `${APP_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/register`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const listingRoutes: MetadataRoute.Sitemap = listings.map((p) => ({
    url: `${APP_URL}/marketplace/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${APP_URL}/library/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const creatorRoutes: MetadataRoute.Sitemap = creators.map((u) => ({
    url: `${APP_URL}/u/${u.username}`,
    lastModified: u.updatedAt,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...listingRoutes, ...articleRoutes, ...creatorRoutes];
}
