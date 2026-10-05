import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "app",
  ssr: false,
  // Prerender the landing page at build time so the browser gets real HTML
  // (hero, headline, CTAs) immediately instead of a spinner that waits for
  // the whole JS bundle to download and hydrate. Other routes remain SPA
  // and are served from build/client/__spa-fallback.html.
  prerender: ["/"],
} satisfies Config;
