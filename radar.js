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

  async function setupApercu(l) {
    if (!l.f || !l.r) return;
    let d;
    try {
      const res = await fetch("/apercu/" + l.f + "_" + l.r + ".json");
      if (!res.ok) return;
      d = await res.json();
    } catch (e) { return; }
    const enZone = d.zone === "France entière" ? "en France" : "en " + d.zone;
    $("#ap-zone").textContent = d.zone;
    $("#ap-titre").textContent = nf.format(d.marches) + " marchés publics (" + d.libelle.toLowerCase() + ") à renouveler " + enZone + ".";
    $("#ap-intro").textContent = "Leur fin est estimée dans 4 à 10 mois, pour " + nf.format(Math.round(d.montant_total_meur)) +
      " M€ attribués au total. Voici les plus proches. Le fichier complet donne aussi le titulaire en place, son SIRET et trois concurrents locaux pour chaque marché.";
    const tb = $("#ap-lignes");
    d.lignes.forEach((x) => {
      const tr = document.createElement("tr");
      tr.append(cell(mois(x.echeance), "date"), cell(x.acheteur), cell(x.objet),
        cell(x.montant ? nf.format(x.montant) + " €" : "—", "num"), cell("dans le fichier", "ap-masque"));
      tb.append(tr);
    });
    const reste = d.marches - d.lignes.length;
    $("#ap-plus").textContent = reste > 0 ? "+ " + nf.format(reste) + " autres marchés dans le fichier." : "";
    const achat = $("#ap-acheter");
    if (d.zone === "France entière") {
      achat.href = "https://buy.stripe.com/" + STRIPE_FRANCE;
      achat.textContent = "Recevoir le fichier France entière · 490 €";
    } else {
      achat.textContent = "Recevoir le fichier " + d.zone + " · 190 €";
    }
    marquerPaiements(l);
    const heroLien = $('.hero a[href="#offres"]');
    if (heroLien) { heroLien.href = "#votre-apercu"; heroLien.textContent = "Voir vos marchés " + enZone + " ↓"; }
    // le prospect voit d'abord ses propres marchés, avant la présentation générale
    const sec = $("#votre-apercu");
    $("main").prepend(sec);
    sec.classList.add("apercu-en-tete");
    sec.hidden = false;
  }

  function init() {
    const y = $("#year");
    if (y) y.textContent = String(Math.max(2026, new Date().getFullYear()));
    setupNav();
    setupLegal();
    const l = lireLien();
    setupVariante(l);
    marquerPaiements(l);
    setupApercu(l);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
