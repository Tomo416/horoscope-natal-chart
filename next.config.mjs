/** GitHub Pages 用の静的書き出し設定 */
const repo = "horoscope-natal-chart";
const isPages = process.env.GITHUB_ACTIONS === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  // https://<ユーザー名>.github.io/horoscope-natal-chart/ で配信されるため
  basePath: isPages ? `/${repo}` : "",
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
