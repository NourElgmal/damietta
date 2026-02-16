/**
 * Vercel serverless function entrypoint.
 * Exports a default handler that forwards requests to the Express `app`.
 * Using ESM: import the app and call it as a function.
 */
import app from "../app.js";

export default function handler(req, res) {
  return app(req, res);
}
