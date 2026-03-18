import express from "express";

const router = express.Router();

// Simple image proxy. Only allow whitelisted hosts to avoid open proxy abuse.
const ALLOWED_HOSTS = ["res.cloudinary.com", "images.unsplash.com", "cdn.example.com"];

router.get("/", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ message: "Missing url parameter" });

  let target;
  try {
    target = new URL(url);
  } catch (err) {
    return res.status(400).json({ message: "Invalid url" });
  }

  if (!ALLOWED_HOSTS.some((h) => target.hostname.endsWith(h))) {
    return res.status(403).json({ message: "Host not allowed" });
  }

  try {
    const r = await fetch(target.href);
    if (!r.ok) return res.status(r.status).send("Failed to fetch image");

    const contentType = r.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    // stream the response body to client
    const body = r.body;
    if (body && typeof body.pipe === "function") {
      body.pipe(res);
    } else {
      const buffer = await r.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error("Image proxy error:", err);
    res.status(500).json({ message: "Error fetching image" });
  }
});

export default router;
