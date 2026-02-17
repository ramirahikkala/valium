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

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Valium web server listening on port ${PORT}`);
  console.log(`Proxying /api/* to ${API_URL}`);
});
