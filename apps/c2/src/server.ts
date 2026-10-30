import http from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { config } from "./config.js";
import { text } from "./http.js";
import { handleBeacon } from "./routes/beacon.js";
import { handleDownload } from "./routes/download.js";
import { handleUpload } from "./routes/upload.js";
import { handlePayloadList } from "./routes/payloads.js";

/**
 * Standalone C2 server.
 *
 * Serves only the three agent-facing endpoints of the sandcat HTTP contact
 * protocol. The operator UI and tRPC API live in the separate web app; the two
 * processes share state only through the database. Keeping the C2 on its own
 * port means exposing it to target hosts does not expose the console.
 */

const server = http.createServer((req, res) => {
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const route = url.pathname.replace(/\/+$/, "") || "/";

  const run = (handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>) =>
    handler(req, res).catch((error) => {
      console.error(`[c2] ${method} ${route} failed:`, error);
      if (!res.headersSent) text(res, 500, "internal error");
    });

  if (route === "/beacon" && method === "POST") return run(handleBeacon);
  if (route === "/file/download" && (method === "GET" || method === "POST")) return run(handleDownload);
  if (route === "/file/upload" && method === "POST") return run(handleUpload);
  if (route === "/payloads" && method === "GET") return run(handlePayloadList);
  if (route === "/health" && method === "GET") return text(res, 200, "ok");

  text(res, 404, "not found");
});

server.listen(config.C2_PORT, config.C2_HOST, () => {
  console.log(`[c2] listening on http://${config.C2_HOST}:${config.C2_PORT}`);
  console.log(`[c2] payloads: ${config.C2_PAYLOAD_DIR}`);
  console.log(`[c2] exfil:    ${config.C2_EXFIL_DIR}`);
});
