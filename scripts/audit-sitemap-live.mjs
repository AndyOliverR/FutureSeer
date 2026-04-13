/**
 * One-off / CI helper: fetch production sitemap.xml and HEAD each <loc>.
 * Usage: node scripts/audit-sitemap-live.mjs [baseUrl]
 * Default baseUrl: https://futureseer.app
 */
import https from "node:https";
import { URL } from "node:url";

const site = (process.argv[2] || "https://futureseer.app").replace(/\/$/, "");

function headPath(pathname) {
  return new Promise((resolve, reject) => {
    const u = new URL(pathname, site);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "HEAD",
        headers: { "User-Agent": "FutureSeer-sitemap-audit/1.0" },
      },
      (res) => {
        resolve({ status: res.statusCode, location: res.headers.location });
        res.resume();
      }
    );
    req.on("error", reject);
    req.setTimeout(25000, () => {
      req.destroy(new Error("timeout"));
    });
    req.end();
  });
}

function getText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "FutureSeer-sitemap-audit/1.0" } }, (res) => {
        let d = "";
        res.on("data", (c) => {
          d += c;
        });
        res.on("end", () => resolve(d));
      })
      .on("error", reject);
  });
}

const xml = await getText(`${site}/sitemap.xml`);
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`Sitemap URLs: ${locs.length} (from ${site}/sitemap.xml)`);
const bad = [];
for (const loc of locs) {
  const path = new URL(loc).pathname;
  try {
    const r = await headPath(path);
    if (![200, 301, 302, 307, 308].includes(r.status)) {
      bad.push({ path, status: r.status, location: r.location });
    }
  } catch (e) {
    bad.push({ path, status: `ERR: ${e.message}` });
  }
}
if (bad.length) {
  console.error("Non-2xx/3xx responses:");
  console.error(JSON.stringify(bad, null, 2));
  process.exit(1);
}
console.log("All sitemap URLs returned 2xx or 3xx.");
