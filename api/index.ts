import { createExpressApp } from "../server/app.js";

const app = createExpressApp();

console.log("[Vercel Serverless Function] API initialized with unified Express routing.");

export default app;
