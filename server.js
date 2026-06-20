const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || "";

if (!API_KEY) {
  console.error("Set ANTHROPIC_API_KEY environment variable");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const apiReq = https.request(
        {
          hostname: "api.anthropic.com",
          path: "/v1/messages",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
          },
        },
        (apiRes) => {
          res.writeHead(apiRes.statusCode, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          });
          apiRes.pipe(res);
        }
      );
      apiReq.on("error", (e) => {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: e.message } }));
      });
      apiReq.write(body);
      apiReq.end();
    });
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key, anthropic-version",
    });
    res.end();
    return;
  }

  const file = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(__dirname, file);
  const ext = path.extname(filePath);
  const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css" };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[ext] || "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("Open that URL in Chrome to use Voice Q&A");
});
