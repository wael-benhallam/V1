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
      ["exemple", "votre-apercu", "offres", "methode", "questions"].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
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

  // espace insécable classique : l'espace fine (U+202F) manque dans la police de titre
  const intl = new Intl.NumberFormat("fr-FR");
  const nf = { format: (n) => intl.format(n).replace(/\u202f/g, "\u00a0") };
  const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const mois = (iso) => { const [y, m] = iso.split("-"); return MOIS[+m - 1] + " " + y; };
  const cell = (txt, cls) => { const td = document.createElement("td"); td.textContent = txt; if (cls) td.className = cls; return td; };

  // Aperçu secteur × région : choisi par le visiteur, ou pré-rempli par le lien des e-mails (?f=&r=).
  // Les menus de l'aperçu et ceux des tarifs (.sel-f / .sel-r) restent synchronisés, et le choix
  // part jusqu'au paiement Stripe : client_reference_id = v<variante>_<famille>_<région|france>.
  const AP_LIGNES = 5;
  const ap = { index: null, l: null, f: "79", r: "ile-de-france" };
  const zoneDe = (f, r) => (ap.index && ap.index[f + "_" + r] ? ap.index[f + "_" + r].zone : "");
  // la région facturée à 190 € : celle de l'aperçu, ou celle du menu des tarifs si l'aperçu est sur « France »
  const regionAchat = () => (ap.r !== "france" ? ap.r : ($(".ap-choix-offres .sel-r") || {}).value || "ile-de-france");

  function majAchats() {
    const base = ["v" + (ap.l.v || "0"), ap.f];
    $$('a[href^="https://buy.stripe.com/"]').forEach((a) => {
      const u = new URL(a.href);
      const france = a.href.includes(STRIPE_FRANCE);
      u.searchParams.set("client_reference_id", base.concat(france ? "france" : regionAchat()).join("_"));
      a.href = u.toString();
    });
    const lib = ap.index[ap.f + "_france"].libelle;
    const reg = ap.index[ap.f + "_" + regionAchat()];
    $$('[data-achat="region"]').forEach((a) => { a.textContent = "Acheter " + reg.zone + " · 190 €"; });
    $$('[data-offre="region"]').forEach((p) => { p.textContent = nf.format(reg.marches) + " marchés · " + lib + " · " + reg.zone; });
    $$('[data-offre="france"]').forEach((p) => { p.textContent = nf.format(ap.index[ap.f + "_france"].marches) + " marchés · " + lib + " · toutes régions"; });
  }

  // Mémorise le choix au clic sur un bouton d'achat, pour la page de confirmation (/merci).
  function suivreAchats() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="https://buy.stripe.com/"]');
      if (!a || !ap.index) return;
      const france = a.href.includes(STRIPE_FRANCE);
      const choix = { libelle: ap.index[ap.f + "_france"].libelle, zone: france ? "France entière" : zoneDe(ap.f, regionAchat()), prix: france ? 490 : 190 };
      try { sessionStorage.setItem("radar-achat", JSON.stringify(choix)); } catch (err) { /* sans stockage : confirmation générique */ }
    });
  }

  async function afficher() {
    const f = ap.f, r = ap.r;
    majAchats();
    let d;
    try {
      const res = await fetch("/apercu/" + f + "_" + r + ".json");
      if (!res.ok) throw new Error(String(res.status));
      d = await res.json();
    } catch (e) { $("#ap-erreur").hidden = false; return; }
    if (f !== ap.f || r !== ap.r) return; // un autre choix a été fait entre-temps
    $("#ap-erreur").hidden = true;
    const france = d.zone === "France entière";
    const enZone = france ? "en France" : "en " + d.zone;
    const n = Math.min(AP_LIGNES, d.lignes.length);
    $("#ap-zone").textContent = d.libelle + " · " + d.zone;
    $("#ap-titre").textContent = nf.format(d.marches) + " marchés publics à échéance " + enZone + " (" + d.libelle.toLowerCase() + ").";
    $("#ap-fichier").textContent = "radar_" + f + "_" + r + ".xlsx";
    $("#ap-intro").textContent = n + " lignes sur " + nf.format(d.marches) + " · " +
      nf.format(Math.round(d.montant_total_meur)) + " M€ HT au total";
    const tb = $("#ap-lignes");
    tb.replaceChildren();
    d.lignes.slice(0, AP_LIGNES).forEach((x) => {
      const tr = document.createElement("tr");
      const c = [cell(mois(x.echeance), "date"), cell(x.acheteur, "buyer"), cell(x.objet),
        cell(x.montant ? nf.format(x.montant) + " €" : "—", "num"), cell("dans le fichier complet", "ap-masque")];
      ["Échéance estimée", "Acheteur", "Objet", "Montant HT", "Titulaire actuel"].forEach((l, i) => { c[i].dataset.l = l; });
      tr.append(...c);
      tb.append(tr);
    });
    const reste = d.marches - n;
    $("#ap-plus").textContent = "Les " + nf.format(d.marches) + " marchés " + enZone + (reste > 0 ? ", dont " + nf.format(reste) + " que vous n’avez pas encore vus" : "") + ".";
    const achat = $("#ap-acheter");
    achat.textContent = france ? "Acheter le fichier France entière · 490 €" : "Acheter le fichier " + d.zone + " · 190 €";
    achat.href = "https://buy.stripe.com/" + (france ? STRIPE_FRANCE : STRIPE_REGION);
    $("#ap-france").hidden = france;
    majAchats();
  }

  function remplirRegions(f, r) {
    const regions = Object.keys(ap.index).filter((k) => k.startsWith(f + "_"))
      .map((k) => ({ r: k.slice(3), zone: ap.index[k].zone, n: ap.index[k].marches }))
      .sort((a, b) => (a.r === "france") - (b.r === "france") || a.zone.localeCompare(b.zone, "fr"));
    const has = (v) => regions.some((x) => x.r === v);
    const val = has(r) ? r : (has("ile-de-france") ? "ile-de-france" : regions[0].r);
    $$(".sel-r").forEach((sel) => {
      const tarifs = !sel.id; // le menu des tarifs ne propose que les régions (France = offre à 490 €)
      const avant = sel.value;
      sel.replaceChildren(...regions.filter((x) => !(tarifs && x.r === "france")).map((x) => {
        const o = document.createElement("option");
        o.value = x.r;
        o.textContent = x.zone + " (" + nf.format(x.n) + " marchés)";
        return o;
      }));
      sel.value = !tarifs || val !== "france" ? val : (has(avant) && avant !== "france" ? avant : "ile-de-france");
    });
    return val;
  }

  function choisir(f, r) {
    ap.f = f;
    ap.r = remplirRegions(f, r);
    $$(".sel-f").forEach((s) => { s.value = f; });
    return afficher();
  }

  async function setupApercu(l) {
    ap.l = l;
    suivreAchats();
    try {
      const res = await fetch("/apercu/index.json");
      if (!res.ok) throw new Error(String(res.status));
      ap.index = await res.json();
    } catch (e) { $("#ap-erreur").hidden = false; return; }
    $$(".sel-f").forEach((s) => s.addEventListener("change", () => choisir(s.value, ap.r)));
    $$(".sel-r").forEach((s) => s.addEventListener("change", () => choisir(ap.f, s.value)));
    $("#ap-choix").addEventListener("submit", (e) => {
      e.preventDefault();
      choisir($("#ap-f").value, $("#ap-r").value).then(() => $("#ap-resultat").scrollIntoView({ behavior: "smooth", block: "start" }));
    });
    const f = l.f && ap.index[l.f + "_france"] ? l.f : "79";
    await choisir(f, l.r || "ile-de-france");
    if (l.f && l.r) {
      const enZone = ap.r === "france" ? "en France" : "en " + zoneDe(ap.f, ap.r);
      const heroLien = $('.hero a[href="#votre-apercu"]');
      if (heroLien) heroLien.textContent = "Voir vos marchés " + enZone;
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
