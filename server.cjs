const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.get("/env.js", (req, res) => {
  const payload = {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY:
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    API_URL: process.env.VITE_API_URL || process.env.API_URL || ""
  };
  res.type("application/javascript").send(
    `window.__APP_ENV__ = ${JSON.stringify(payload)};`
  );
});

app.use(express.static(path.join(__dirname, "dist")));

app.listen(port, "0.0.0.0", () => {});