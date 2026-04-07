const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:8000";

app.use(
  "/api",
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
  })
);

// Sali (gym) app — served for sali.* hostname
const saliDir = path.join(__dirname, "public", "sali");
const publicDir = path.join(__dirname, "public");

app.use(function (req, res, next) {
  var host = req.hostname || "";
  if (!host.startsWith("sali.")) return next();

  // Try sali-specific static files first, then shared assets (style.css, favicon.svg)
  express.static(saliDir)(req, res, function () {
    express.static(publicDir)(req, res, function () {
      res.sendFile(path.join(saliDir, "index.html"));
    });
  });
});

// Main app
app.use(express.static(publicDir));

app.listen(PORT, () => {
  console.log(`Valium web server listening on port ${PORT}`);
  console.log(`Proxying /api/* to ${API_URL}`);
});
