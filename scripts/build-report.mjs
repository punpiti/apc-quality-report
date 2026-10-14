import { cpSync, existsSync, mkdtempSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { addAnalytics } from "./add-analytics.mjs";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = process.env.DATA_ANALYTICS_PLUGIN_ROOT || join(
  homedir(), ".codex/plugins/cache/openai-curated-remote/data-analytics/1.0.11",
);
for (const script of ["data-app.mjs", "prepare-data-app.mjs"]) {
  if (!existsSync(join(plugin, "scripts", script))) {
    throw new Error("Set DATA_ANALYTICS_PLUGIN_ROOT to an installed Data Analytics plugin directory.");
  }
}
const scratch = mkdtempSync(join(tmpdir(), "apc-quality-build-"));
const project = join(scratch, "report");
function run(script, args, cwd = repo) {
  const result = spawnSync(process.execPath, [join(plugin, "scripts", script), ...args], {
    cwd, stdio: "inherit", shell: false,
  });
  if (result.error || result.status !== 0) throw new Error(`${script} failed`);
}
run("prepare-data-app.mjs", [
  "--surface", "report", "--output", project,
  "--snapshot", join(repo, "data/report_snapshot.json"),
]);
cpSync(join(repo, "src/content/report"), join(project, "src/content/report"), { recursive: true });
cpSync(join(repo, "src/theme.css"), join(project, "src/theme.css"));
// Keep the existing report identity, evidence dates, and completion state.
cpSync(join(repo, "data/report_snapshot.json"), join(project, "src/data.json"));
run("data-app.mjs", ["build", "--project-dir", project, "--separate-data"]);
run("data-app.mjs", [
  "export-offline", "--project-dir", ".", "--output", ".data-app-offline/exports/report.html",
], project);
const receipt = addAnalytics(
  join(project, ".data-app-offline/exports/report.html"),
  join(repo, "site/apc-quality-report.html"),
);
console.log(JSON.stringify({ output: "site/apc-quality-report.html", scratch, ...receipt }));
