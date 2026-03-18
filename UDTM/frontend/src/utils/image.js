const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export function proxiedImage(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes("cloudinary.com") || u.hostname.includes("images.unsplash.com")) {
      return `${API_BASE}/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch (e) {
    return url;
  }
  return url;
}

export default proxiedImage;
