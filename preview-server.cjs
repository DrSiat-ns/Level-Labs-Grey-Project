const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const relativePath = decodeURIComponent(requestUrl.pathname === "/" ? "index.html" : requestUrl.pathname.slice(1));
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Accept-Ranges": "bytes",
      "Content-Length": stats.size,
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(4173, "127.0.0.1");
