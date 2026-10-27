import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/me",
        "/vouchers",
        "/g/",
        "/merchant",
        "/admin",
        "/spin/return",
        "/pay/",
      ],
    },
  };
}
