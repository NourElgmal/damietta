/**
 * Simple API Key middleware: checks `x-api-key` header against `process.env.API_KEY`.
 * This middleware is safe to use in addition to JWT for an extra layer of access control.
 */
export default function apiKeyMiddleware(req, res, next) {
  const key = req.headers["x-api-key"];
  // If API_KEY is not set we allow the request to continue (useful for local dev).
  if (!process.env.API_KEY) return next();
  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized: invalid API key" });
  }
  return next();
}
