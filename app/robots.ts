import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/"], // 内部APIや認証関連は除外
    },
    sitemap: "https://kashikari.yu-fu.site/sitemap.xml",
  };
}
