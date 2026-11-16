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
  function setupVariante() {
    const v = new URLSearchParams(location.search).get("v");
    if (!v || !/^[1-9]\d{0,2}$/.test(v)) return;
    try {
      if (!sessionStorage.getItem("radar-v")) {
        sessionStorage.setItem("radar-v", v);
        if (navigator.sendBeacon) navigator.sendBeacon("/api/c?v=" + v);
        else fetch("/api/c?v=" + v, { method: "POST", keepalive: true }).catch(() => {});
      }
    } catch (e) { /* stockage indisponible : on ne compte pas */ }
    $$('a[href^="https://buy.stripe.com/"]').forEach((a) => {
      const u = new URL(a.href);
      u.searchParams.set("client_reference_id", "v" + v);
      a.href = u.toString();
    });
  }

  function init() {
    const y = $("#year");
    if (y) y.textContent = String(Math.max(2026, new Date().getFullYear()));
    setupNav();
    setupLegal();
    setupVariante();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
