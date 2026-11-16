// Compteur de clics anonyme : /api/c?v=<numéro de variante>
// N'enregistre ni adresse IP, ni cookie, ni identifiant : un petit fichier par clic dans Vercel Blob.
// Sans magasin Blob relié au projet (variable BLOB_READ_WRITE_TOKEN), la route répond sans rien enregistrer.
const { put } = require("@vercel/blob");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const v = String((req.query && req.query.v) || "");
  const ua = String(req.headers["user-agent"] || "");
  const robot = /bot|crawl|spider|scan|preview|monitor|curl|python|headless/i.test(ua);
  if (!/^[1-9]\d{0,2}$/.test(v) || robot || req.method === "HEAD" || !process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(204).end();
  }
  try {
    const nom = `clics/${v}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.txt`;
    await put(nom, "1", { access: "public", addRandomSuffix: false, contentType: "text/plain" });
  } catch (e) {
    console.error("compteur", e && e.message);
  }
  return res.status(204).end();
};
