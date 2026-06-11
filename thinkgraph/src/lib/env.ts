import "server-only";
import { config } from "dotenv";
import path from "path";

// MVP credential loading. The app's active env file is `thinkgraph/.env.example`
// (git-ignored — see .gitignore). We also fall back to `.env.local` and the
// shared repo-root `bloganalytics/.env`. `override: false` means real
// environment variables (e.g. Vercel dashboard vars) always win, and any
// missing file is a silent no-op.
let loaded = false;

export function loadSharedEnv(): void {
  if (loaded) return;
  loaded = true;
  const appRoot = process.cwd();
  config({ path: path.join(appRoot, ".env.example"), override: false });
  config({ path: path.join(appRoot, ".env.local"), override: false });
  config({ path: path.join(appRoot, "..", ".env"), override: false });
}

loadSharedEnv();
