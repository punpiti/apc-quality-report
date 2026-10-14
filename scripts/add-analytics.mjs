import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

export function addAnalytics(input, output) {
  const measurementId = "G-BWX7PFH4XM";
  const original = readFileSync(input, "utf8");
  if (!original.includes("<head>") || !original.includes("apc-executive-summary")) {
    throw new Error("Expected the complete verified APC report HTML.");
  }
  if (original.includes("googletagmanager.com/gtag/js")) {
    throw new Error("The input already contains Google Analytics.");
  }
  const analytics = `
<!-- Google Analytics: same measurement ID as urban.cpe.ku.ac.th -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "${measurementId}", { anonymize_ip: true });
</script>
`;
  const publicStyles = readFileSync(new URL("./public-report.css", import.meta.url), "utf8");
  const html = original.replace("<head>", `<head>\n<meta name="author" content="Punpiti Piamsa-nga">\n<style id="apc-public-report-controls">${publicStyles}</style>${analytics}`);
  writeFileSync(output, html);
  return { measurementId, bytes: Buffer.byteLength(html), sha256: createHash("sha256").update(html).digest("hex") };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!process.argv[2] || !process.argv[3]) throw new Error("Usage: node scripts/add-analytics.mjs input.html output.html");
  console.log(JSON.stringify(addAnalytics(process.argv[2], process.argv[3])));
}
