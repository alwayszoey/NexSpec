import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

import apiApp from "./api/index.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Mount API routes
app.use(apiApp);

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: Assuming static build is present at /dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Since App is routing client side possibly
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
