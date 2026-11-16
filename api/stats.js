// Clics par variante : /api/stats → { actif, clics: { "1": n, … }, total }
// Chiffres agrégés uniquement. Lu par le robot de prospection pour le test A/B.
const { list } = require("@vercel/blob");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json({ actif: false, raison: "aucun magasin Vercel Blob relié au projet" });
  }
  try {
    const clics = {};
    let total = 0;
    let cursor;
    do {
      const page = await list({ prefix: "clics/", limit: 1000, cursor });
      for (const b of page.blobs) {
        const v = b.pathname.split("/")[1];
        clics[v] = (clics[v] || 0) + 1;
        total += 1;
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return res.status(200).json({ actif: true, clics, total });
  } catch (e) {
    return res.status(200).json({ actif: false, raison: String((e && e.message) || e).slice(0, 200) });
  }
};
