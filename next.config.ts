import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/fight-list" : "",
  },
  images: {
    unoptimized: true,
  },
  ...(isGitHubPages
    ? {
      output: "export",
      basePath: "/fight-list",
      assetPrefix: "/fight-list",
      trailingSlash: true,
    }
    : {}),
};

export default nextConfig;
