import { MetadataRoute } from "next";

import { METADATA } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: METADATA.TITLE,
    short_name: METADATA.SHORT_NAME,
    description: METADATA.DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f1e",
    theme_color: "#10b981",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
