import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = "glide";

const nextConfig: NextConfig = isGitHubPages
  ? {
      output: "export",
      basePath: `/${repoName}`,
      assetPrefix: `/${repoName}/`,
      trailingSlash: true,
    }
  : {};

export default nextConfig;
