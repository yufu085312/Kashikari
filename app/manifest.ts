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
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
