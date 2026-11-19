/* radar.js — interactions de la page Radar (menu mobile, mentions légales). */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  function setupNav() {
    const header = $(".site-header");
    const toggle = $("#menu-toggle");
    const menu = $("#mobile-menu");
    const setMenu = (open) => {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      $(".icon-open", toggle).classList.toggle("hidden", open);
      $(".icon-close", toggle).classList.toggle("hidden", !open);
    };
    toggle.addEventListener("click", () => setMenu(menu.hidden));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); } });
    window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if ("IntersectionObserver" in window) {
      const links = $$(".nav-link");
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${en.target.id}`));
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["contenu-fichier", "offres", "methode"].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  function setupLegal() {
    const modal = $("#legal-modal");
    let trigger = null;
    const open = (t) => { if (modal.open) return; trigger = t || null; modal.showModal(); $(".modal-body", modal).scrollTop = 0; };
    const close = () => { if (!modal.open) return; modal.close(); if (trigger) trigger.focus({ preventScroll: true }); };
    modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("[data-close]")) close(); });
    $("#open-legal").addEventListener("click", (e) => open(e.currentTarget));
    if (location.hash === "#mentions-legales") open();
  }

  // Visite venue d'un e-mail (lien …?v=<numéro>) : un signal anonyme par session, sans cookie,
  // et le numéro de variante suit jusqu'au paiement Stripe pour savoir quelle version a vendu.
  // Le lien porte aussi f=<famille> et r=<région> : la page montre alors l'aperçu du prospect, et
  // client_reference_id = v<variante>_<famille>_<région> permet de livrer le bon fichier sans rien demander.
  const STRIPE_FRANCE = "aFadR92u22fSef9bFj5AQ01";
  const STRIPE_REGION = "cNi28r0lU07K8UPgZD5AQ00";

  function lireLien() {
    const q = new URLSearchParams(location.search);
    const ok = (val, re) => (val && re.test(val) ? val : null);
    return { v: ok(q.get("v"), /^[1-9]\d{0,2}$/), f: ok(q.get("f"), /^\d{2}$/), r: ok(q.get("r"), /^[a-z][a-z-]{1,40}$/) };
  }

  function marquerPaiements(l) {
    if (!l.v && !l.f) return;
    $$('a[href^="https://buy.stripe.com/"]').forEach((a) => {
      const u = new URL(a.href);
      const parts = ["v" + (l.v || "0")];
      if (l.f) parts.push(l.f, a.href.includes(STRIPE_FRANCE) ? "france" : (l.r || ""));
      u.searchParams.set("client_reference_id", parts.filter(Boolean).join("_"));
      a.href = u.toString();
    });
  }

  function setupVariante(l) {
    if (!l.v) return;
    try {
      if (!sessionStorage.getItem("radar-v")) {
        sessionStorage.setItem("radar-v", l.v);
        if (navigator.sendBeacon) navigator.sendBeacon("/api/c?v=" + l.v);
        else fetch("/api/c?v=" + l.v, { method: "POST", keepalive: true }).catch(() => {});
      }
    } catch (e) { /* stockage indisponible : on ne compte pas */ }
  }

  const nf = new Intl.NumberFormat("fr-FR");
  const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const mois = (iso) => { const [y, m] = iso.split("-"); return MOIS[+m - 1] + " " + y; };
  const cell = (txt, cls) => { const td = document.createElement("td"); td.textContent = txt; if (cls) td.className = cls; return td; };

  // Aperçu secteur × région : choisi par le visiteur, ou pré-rempli par le lien des e-mails (?f=&r=).
  const ap = { index: null, l: null };

  function majAchats(f, r) {
    const parts = ["v" + (ap.l.v || "0"), f];
    $$('a[href^="https://buy.stripe.com/"]').forEach((a) => {
      const u = new URL(a.href);
      const france = a.href.includes(STRIPE_FRANCE);
      u.searchParams.set("client_reference_id", parts.concat(france ? "france" : r).join("_"));
      a.href = u.toString();
    });
  }

  async function afficher(f, r) {
    let d;
    try {
      const res = await fetch("/apercu/" + f + "_" + r + ".json");
      if (!res.ok) return;
      d = await res.json();
    } catch (e) { return; }
    const enZone = d.zone === "France entière" ? "en France" : "en " + d.zone;
    $("#ap-zone").textContent = d.libelle + " · " + d.zone;
    $("#ap-titre").textContent = nf.format(d.marches) + " marchés publics (" + d.libelle.toLowerCase() + ") à renouveler " + enZone + ".";
    $("#ap-intro").textContent = "Leur fin est estimée dans 4 à 10 mois, pour " + nf.format(Math.round(d.montant_total_meur)) +
      " M€ attribués au total. Voici les plus proches. Le fichier complet donne aussi le titulaire en place, son SIRET et trois concurrents locaux pour chaque marché.";
    const tb = $("#ap-lignes");
    tb.replaceChildren();
    d.lignes.forEach((x) => {
      const tr = document.createElement("tr");
      tr.append(cell(mois(x.echeance), "date"), cell(x.acheteur), cell(x.objet),
        cell(x.montant ? nf.format(x.montant) + " €" : "—", "num"), cell("dans le fichier", "ap-masque"));
      tb.append(tr);
    });
    const reste = d.marches - d.lignes.length;
    $("#ap-plus").textContent = reste > 0 ? "+ " + nf.format(reste) + " autres marchés dans le fichier." : "";
    const achat = $("#ap-acheter");
    achat.href = "https://buy.stripe.com/" + (d.zone === "France entière" ? STRIPE_FRANCE : STRIPE_REGION);
    achat.textContent = d.zone === "France entière" ? "Recevoir le fichier France entière · 490 €"
      : "Recevoir le fichier " + d.zone + " · 190 €";
    majAchats(f, r);
  }

  function remplirRegions(f, r) {
    const sel = $("#ap-r");
    const regions = Object.keys(ap.index).filter((k) => k.startsWith(f + "_"))
      .map((k) => ({ r: k.slice(3), zone: ap.index[k].zone, n: ap.index[k].marches }))
      .sort((a, b) => (a.r === "france") - (b.r === "france") || a.zone.localeCompare(b.zone, "fr"));
    sel.replaceChildren(...regions.map((x) => {
      const o = document.createElement("option");
      o.value = x.r;
      o.textContent = x.zone + " (" + nf.format(x.n) + " marchés)";
      return o;
    }));
    sel.value = regions.some((x) => x.r === r) ? r : (regions.some((x) => x.r === "ile-de-france") ? "ile-de-france" : regions[0].r);
    return sel.value;
  }

  async function setupApercu(l) {
    ap.l = l;
    try {
      const res = await fetch("/apercu/index.json");
      if (!res.ok) throw 0;
      ap.index = await res.json();
    } catch (e) { $("#votre-apercu").hidden = true; return; }
    const fSel = $("#ap-f");
    let f = l.f && ap.index[l.f + "_france"] ? l.f : "79";
    fSel.value = f;
    let r = remplirRegions(f, l.r);
    fSel.addEventListener("change", () => { f = fSel.value; r = remplirRegions(f, r); afficher(f, r); });
    $("#ap-r").addEventListener("change", (e) => { r = e.target.value; afficher(f, r); });
    await afficher(f, r);
    if (l.f && l.r) {
      const enZone = r === "france" ? "en France" : "en " + ap.index[f + "_" + r].zone;
      const heroLien = $('.hero a[href="#votre-apercu"]');
      if (heroLien) { heroLien.href = "#votre-apercu"; heroLien.textContent = "Voir vos marchés " + enZone + " ↓"; }
      // le prospect voit d'abord ses propres marchés, avant la présentation générale
      const sec = $("#votre-apercu");
      $("main").prepend(sec);
      sec.classList.add("apercu-en-tete");
    }
  }

  function init() {
    const y = $("#year");
    if (y) y.textContent = String(Math.max(2026, new Date().getFullYear()));
    setupNav();
    setupLegal();
    const l = lireLien();
    setupVariante(l);
    setupApercu(l);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
