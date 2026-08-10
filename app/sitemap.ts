import type { MetadataRoute } from "next";

const publicRoutes = [
  "/",
  "/tools",
  "/tools/pdf-zusammenfuegen",
  "/projekte",
  "/projekte/pdf-tool",
  "/informationen",
  "/community",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => ({
    url: new URL(path, "https://jnsw.de").toString(),
  }));
}
