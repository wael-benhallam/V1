# SEO: getting www.bistouri.app into Google

Audit of 22 Nov 2026. The technical basics are in place; the site is not showing because
Google has not been told about it and nothing links to it yet.

## Already fine (checked on the live site)

- HTTPS enforced: `http://` and `bistouri.app` both 308 to `https://www.bistouri.app/`, HSTS on
- `robots.txt` and `sitemap.xml` served; canonical, title, description, Open Graph (1200×630) set
- One H1, clean H2/H3 order, no images missing alt text (the page has no `<img>`)
- No broken links (anchors, Stripe links, sample file, preview data all return 200)
- Fast: DOM ready in ~140 ms, layout shift 0; no `noindex` on the home page

## Changed in this branch

- Mobile: hero text and buttons ran into the right edge on phones (grid column sized to content). Fixed.
- Schema: added Organization + WebSite; offers now say `InStock` and name the seller.
- `robots.txt`: stopped blocking `/merci`. It already says `noindex`; blocking it hid that from Google.
- `vercel.json`: `cleanUrls` so `/index.html` and `/merci.html` redirect to `/` and `/merci`.
- Sitemap `lastmod` updated.

## Search Console (you do this; it needs your Google account)

1. https://search.google.com/search-console → Add property → **Domain** → `bistouri.app`.
2. Google gives a `google-site-verification=…` TXT record. Add it in Vercel → Domains → bistouri.app → DNS
   (or at the registrar if DNS is not on Vercel). Click Verify.
3. Sitemaps → submit `https://www.bistouri.app/sitemap.xml`.
4. URL Inspection → `https://www.bistouri.app/` → Request indexing.
5. Same in Bing Webmaster Tools (import from Search Console, 1 click). Bing also feeds DuckDuckGo and Ecosia.

Expect a few days to two weeks before the page appears for `bistouri radar`, longer for generic queries.

## Backlinks (in order of effort vs. value)

1. **Free profiles, today:** Google Business Profile (service area, no address shown), LinkedIn company
   page and your own LinkedIn profile, Malt/Indy profile if you have one. Each links to the site.
2. **data.gouv.fr "Réutilisations":** declare the Radar as a reuse of the DECP dataset. Free, official,
   relevant, and seen by exactly the people who look at public procurement data.
3. **The cabinets you already contact:** ask partners who resell or recommend the file to link it from
   their resources or partners page. One sentence in the partner email.
4. **Write one useful public post:** e.g. "10 905 marchés publics arrivent à échéance d'ici l'été 2027:
   ce que montrent les DECP", with 3 charts by sector. Post on LinkedIn, send to sector trade press
   (propreté, sécurité, maintenance newsletters), and to procurement blogs. Data stories get cited.
5. **Directories that matter in this niche:** startup/SaaS lists for French SMEs and govtech lists
   (Société Numérique, GovTech listings). Skip paid link packages and mass directories: they don't help
   and can hurt.

## Bigger lever, later

The site is one page, so it can only rank for a handful of queries. Pages per sector × region
("Marchés de nettoyage arrivant à échéance en Bretagne"), built from the `apercu/` data, would each
target searches buyers actually type. Worth doing only if Search Console shows impressions on these
terms after a few weeks.
