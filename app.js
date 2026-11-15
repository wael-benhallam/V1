/* ─────────────────────────────────────────────────────────────
   app.js — logique interactive (vanilla JS, zéro dépendance)
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  const CFG = window.SITE_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const get = (path, obj = CFG) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ══════════════ Données : packs ══════════════ */
  const PACKS = [
    { id: "pack-01", num: "01", name: "Assistant IA Métier", price: "490 €", delay: "Livré en 5 jours" },
    { id: "pack-02", num: "02", name: "Pipeline d’Automatisation", price: "890 €", delay: "7 à 10 jours" },
    { id: "pack-03", num: "03", name: "Atelier & Déploiement", price: "1 190 €", delay: "Demi-journée" },
    { id: "diagnostic", num: "—", name: "Je ne sais pas encore", price: "Gratuit", delay: "Diagnostic 15 min" },
  ];

  /* ══════════════ Données : études de cas ══════════════ */
  const CASES = {
    "01": {
      badge: "Étude 01 · Admin",
      title: "Automatiser le tri et les brouillons de réponse de 250 emails entrants",
      lede: "Un cabinet de 6 personnes reçoit environ 250 emails par semaine sur une boîte partagée. Près d’un message sur deux appelle une réponse quasi identique : demande de rendez-vous, pièce manquante, relance de facture, question de suivi.",
      kpis: [["-4h30", "par semaine"], ["≈ 200 h", "récupérées / an"], ["0", "envoi automatique"], ["< 10 €", "d’API / mois"]],
      problem: "Le tri était fait à la main chaque matin, puis chaque réponse rédigée depuis zéro. Résultat : 5 h 10 hebdomadaires absorbées, des délais de réponse irréguliers et des messages urgents noyés dans le volume.",
      arch: [
        ["Connecteur", "API Gmail ou Microsoft Graph (Outlook) avec des droits limités : lecture des messages et création de brouillons. Aucun droit d’envoi."],
        ["Orchestration", "Script Python planifié toutes les 10 minutes (cron sur un petit serveur ou une tâche planifiée Windows)."],
        ["Classification", "Appel LLM avec sortie JSON contrainte : catégorie, urgence (1-3), langue, indice de confiance."],
        ["Rédaction", "Brouillon généré à partir de 12 modèles validés par le cabinet + contexte du fil. Le ton et les formules sont figés."],
        ["Garde-fous", "Confiance < 0,8 → libellé « À traiter manuellement ». Données personnelles masquées avant l’appel API. Journal CSV de chaque décision."],
      ],
      steps: [
        ["Réception", "le message arrive dans la boîte partagée."],
        ["Classement", "le script lui attribue un libellé (RDV, Pièces, Facturation, Urgent, Autre)."],
        ["Brouillon", "une réponse est préparée dans le fil, prête à relire."],
        ["Validation humaine", "un collaborateur relit, ajuste si besoin et envoie en un clic."],
        ["Suivi", "un récapitulatif quotidien liste les urgences et les messages non traités."],
      ],
      roi: [["Avant : tri + rédaction", "5 h 10 / sem."], ["Après : relecture des brouillons", "0 h 40 / sem."], ["Gain net", "4 h 30 / sem."]],
      roiNote: "Sur 44 semaines travaillées : environ 198 heures par an. Coût de fonctionnement : quelques euros d’API par mois.",
      stack: ["Gmail API", "Microsoft Graph", "Python", "API LLM", "JSON Schema", "Cron"],
      pack: "pack-02",
    },
    "02": {
      badge: "Étude 02 · Savoir",
      title: "Transformer 500 pages de procédures PDF en assistant interne fiable",
      lede: "Un établissement dispose de 500 pages de procédures réparties dans une quarantaine de PDF. L’information existe, mais personne ne la retrouve : les questions remontent toujours vers les deux mêmes référents.",
      kpis: [["-3h00", "par semaine"], ["< 10 s", "par réponse"], ["100 %", "réponses sourcées"], ["40", "questions de test"]],
      problem: "Les référents passaient environ 3 heures par semaine à répondre à des questions déjà documentées. Les nouveaux arrivants mettaient des semaines à devenir autonomes, et les versions obsolètes des procédures circulaient encore.",
      arch: [
        ["Ingestion", "Extraction du texte PDF (PyMuPDF), découpage par section en conservant titres, numéros de page et date de version."],
        ["Indexation", "Embeddings de chaque passage stockés dans un index vectoriel (Chroma ou pgvector), hébergé chez le client."],
        ["Recherche", "Recherche hybride : sémantique + mots-clés (BM25) pour ne pas rater les références exactes (codes, numéros d’article)."],
        ["Réponse", "Le LLM répond uniquement à partir des passages retrouvés, cite le document et la page, et répond « je ne trouve pas » sinon."],
        ["Interface", "Page web interne protégée par mot de passe, ou bot Teams / Slack. Mise à jour : déposer un PDF dans le dossier suffit."],
      ],
      steps: [
        ["Question", "le collaborateur pose sa question en langage courant."],
        ["Recherche", "les 6 passages les plus pertinents sont retrouvés dans la base."],
        ["Synthèse", "une réponse courte est rédigée, avec citations cliquables vers la page source."],
        ["Contrôle", "en l’absence de source fiable, l’assistant le dit et oriente vers le référent."],
        ["Amélioration", "les questions sans réponse sont journalisées pour compléter la documentation."],
      ],
      roi: [["Avant : questions aux référents", "3 h 20 / sem."], ["Après : cas non couverts", "0 h 20 / sem."], ["Gain net", "3 h 00 / sem."]],
      roiNote: "Fiabilité vérifiée sur un jeu de 40 questions validées par les référents avant mise en service. Gain supplémentaire non chiffré : intégration des nouveaux arrivants.",
      stack: ["PyMuPDF", "Embeddings", "Chroma / pgvector", "BM25", "API LLM", "Teams / Slack"],
      pack: "pack-01",
    },
    "03": {
      badge: "Étude 03 · Opérations",
      title: "Générer des devis, comptes-rendus et fiches structurées sans saisie",
      lede: "Une PME de services produit chaque semaine une quinzaine de devis et autant de comptes-rendus de visite. Les informations existent déjà dans des notes, des emails ou des mémos vocaux, mais tout est ressaisi à la main.",
      kpis: [["-6h00", "par semaine"], ["2 min", "par devis"], ["0", "calcul fait par l’IA"], ["1", "gabarit PDF unique"]],
      problem: "Chaque devis demandait 20 à 25 minutes de copier-coller entre notes, grille tarifaire et modèle Word, avec des erreurs de montants régulières. Les comptes-rendus étaient rédigés le soir, en retard.",
      arch: [
        ["Entrée", "Formulaire court (Tally ou Notion) ou note vocale transcrite, depuis le téléphone, juste après le rendez-vous."],
        ["Orchestration", "Scénario Make déclenché à chaque nouvelle entrée, avec gestion des erreurs et alertes email."],
        ["Extraction", "Le LLM transforme la note libre en champs structurés (client, prestations, quantités, remarques) selon un schéma strict."],
        ["Calcul", "Montants calculés de façon déterministe depuis la grille tarifaire Notion / Google Sheets. L’IA ne calcule jamais un prix."],
        ["Génération", "Remplissage d’un gabarit (Google Docs / HTML) puis export PDF, classement dans Drive et brouillon d’email au client."],
      ],
      steps: [
        ["Saisie express", "30 secondes de note ou de dictée après le rendez-vous."],
        ["Structuration", "les champs sont extraits et rapprochés du catalogue de prestations."],
        ["Chiffrage", "les lignes et totaux sont calculés depuis la grille tarifaire officielle."],
        ["Document", "le devis ou le compte-rendu PDF est généré à la charte de l’entreprise."],
        ["Validation", "le responsable relit le brouillon d’email et l’envoie."],
      ],
      roi: [["Avant : ~30 documents × 13 min", "6 h 30 / sem."], ["Après : relecture × 1 min", "0 h 30 / sem."], ["Gain net", "6 h 00 / sem."]],
      roiNote: "Sur 44 semaines : environ 264 heures par an. Bénéfice secondaire : plus aucune erreur de montant, devis envoyés le jour même.",
      stack: ["Notion", "Google Sheets", "Make", "Tally", "API LLM", "Génération PDF"],
      pack: "pack-02",
    },
  };

  /* ══════════════ Liens dynamiques depuis config.js ══════════════ */
  const isPlaceholder = (v) => !v || /VOTRE_|votre-identifiant|votre-domaine/i.test(v);
  const calLink = get("booking.calLink") || "";
  const email = get("contact.email") || "";

  function calUrl(packId) {
    const custom = get(`booking.packLinks.${packId}`);
    const base = custom || calLink;
    if (!base) return "#reserver";
    const pack = PACKS.find((p) => p.id === packId);
    if (!pack || custom) return base;
    try {
      const u = new URL(base);
      u.searchParams.set("notes", `Intérêt : ${pack.name}${pack.id !== "diagnostic" ? ` (${pack.price})` : ""}`);
      return u.toString();
    } catch { return base; }
  }

  function mailUrl(packId) {
    if (!email) return "#reserver";
    const pack = PACKS.find((p) => p.id === packId);
    const subject = pack && pack.id !== "diagnostic" ? `Demande — ${pack.name}` : get("contact.emailSubject") || "Demande de diagnostic";
    const body = pack && pack.id !== "diagnostic"
      ? `Bonjour,\n\nJe suis intéressé(e) par le pack « ${pack.name} » (${pack.price}).\n\nMon activité :\nLa tâche que je souhaite automatiser :\n\nMerci,`
      : "Bonjour,\n\nJe souhaite échanger sur l’automatisation d’une tâche répétitive.\n\nMerci,";
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function injectConfig() {
    $$("[data-cfg-text]").forEach((el) => {
      const v = get(el.dataset.cfgText);
      if (v) el.textContent = v;
    });
    $$("[data-cfg-href]").forEach((el) => {
      const type = el.dataset.cfgHref;
      if (type === "cal" && calLink) {
        el.href = calUrl("diagnostic");
        el.target = "_blank";
        el.rel = "noopener";
      } else if (type === "mailto" && email) {
        el.href = mailUrl();
      }
    });
    const y = $("#year");
    if (y) y.textContent = String(Math.max(2026, new Date().getFullYear()));

    if (isPlaceholder(calLink) || isPlaceholder(email)) {
      console.info("[config] Valeurs d’exemple détectées dans config.js — pensez à les remplacer avant la mise en ligne.");
    }
  }

  /* ══════════════ Modales (<dialog>) ══════════════ */
  let lastTrigger = null;

  function openModal(dialog, trigger) {
    if (!dialog || dialog.open) return;
    lastTrigger = trigger || document.activeElement;
    dialog.classList.remove("is-closing");
    dialog.showModal();
    const body = $(".modal-body", dialog);
    if (body) body.scrollTop = 0;
  }

  function closeModal(dialog) {
    if (!dialog || !dialog.open || dialog.classList.contains("is-closing")) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const done = () => {
      dialog.classList.remove("is-closing");
      dialog.close();
      if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus({ preventScroll: true });
    };
    if (reduce) return done();
    dialog.classList.add("is-closing");
    setTimeout(done, 170);
  }

  function setupModals() {
    $$("dialog.modal").forEach((d) => {
      // Fermeture : bouton, clic sur le fond, Échap (animée)
      d.addEventListener("click", (e) => {
        if (e.target === d || e.target.closest("[data-close]")) closeModal(d);
      });
      d.addEventListener("cancel", (e) => { e.preventDefault(); closeModal(d); });
    });
  }

  /* ── Étude de cas ── */
  function renderCase(id) {
    const c = CASES[id];
    if (!c) return "";
    const pack = PACKS.find((p) => p.id === c.pack);
    return `
      <h2 class="cs-title" id="case-modal-title">${esc(c.title)}</h2>
      <p class="cs-lede">${esc(c.lede)}</p>
      <div class="cs-kpis">${c.kpis.map(([v, l]) => `<div class="cs-kpi"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div>

      <h3 class="cs-h">Le problème</h3>
      <p class="cs-p">${esc(c.problem)}</p>

      <h3 class="cs-h">Architecture technique</h3>
      <ul class="cs-arch">${c.arch.map(([k, v]) => `<li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join("")}</ul>

      <h3 class="cs-h">Le workflow, étape par étape</h3>
      <ol class="cs-steps">${c.steps.map(([k, v]) => `<li><b>${esc(k)}</b> : ${esc(v)}</li>`).join("")}</ol>

      <h3 class="cs-h">ROI chiffré</h3>
      <div class="cs-roi">${c.roi.map(([k, v], i) => `<div class="${i === c.roi.length - 1 ? "is-total" : ""}"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join("")}</div>
      <p class="cs-note">${esc(c.roiNote)}</p>

      <h3 class="cs-h">Stack</h3>
      <ul class="cs-tags">${c.stack.map((s) => `<li class="chip">${esc(s)}</li>`).join("")}</ul>

      <div class="cs-cta">
        <p>Le même système, adapté à vos outils ?<span class="cs-cta-sub">Format conseillé : Pack ${esc(pack.num)}, ${esc(pack.name)}</span></p>
        <button type="button" class="btn btn-light justify-center" data-pack="${esc(c.pack)}">Réserver ce format →</button>
      </div>`;
  }

  function setupCases() {
    const modal = $("#case-modal");
    $$("[data-case]").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.case;
        $("#case-modal-badge").textContent = CASES[id].badge;
        $("#case-modal-body").innerHTML = renderCase(id);
        openModal(modal, card);
      });
    });
  }

  /* ── Réservation avec pré-sélection du pack ── */
  function setupBooking() {
    const modal = $("#booking-modal");
    const fs = $("#pack-options");
    const calBtn = $("#booking-cal");
    const mailBtn = $("#booking-mail");

    fs.insertAdjacentHTML("beforeend", PACKS.map((p) => `
      <label class="pack-opt">
        <input type="radio" name="pack" value="${p.id}">
        <span class="flex flex-col leading-snug">
          <span class="po-name">${p.num !== "—" ? `Pack ${p.num} · ` : ""}${esc(p.name)}</span>
          <span class="po-meta">${esc(p.delay)}</span>
        </span>
        <span class="po-price">${esc(p.price)}</span>
      </label>`).join(""));

    const sync = () => {
      const sel = ($("input[name=pack]:checked", fs) || {}).value || "diagnostic";
      calBtn.href = calUrl(sel);
      mailBtn.href = mailUrl(sel);
    };
    fs.addEventListener("change", sync);

    calBtn.addEventListener("click", () => setTimeout(() => closeModal(modal), 150));

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-pack]");
      if (!btn) return;
      const id = btn.dataset.pack;
      const input = $(`input[value="${id}"]`, fs);
      if (input) input.checked = true;
      sync();
      const caseModal = $("#case-modal");
      if (caseModal.open) {
        caseModal.close();
        caseModal.classList.remove("is-closing");
      }
      openModal(modal, btn);
      if (input) input.focus({ preventScroll: true });
    });
  }

  /* ── Mentions légales ── */
  function renderLegal() {
    const L = get("legal") || {};
    const H = L.host || {};
    const site = get("brand.siteUrl") || location.origin;
    const mail = esc(email);
    return `
      <h2 id="legal-title">Mentions légales</h2>
      <p>Conformément aux articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN), les informations suivantes sont portées à la connaissance des utilisateurs du site <a href="${esc(site)}">${esc(site.replace(/^https?:\/\//, ""))}</a>.</p>

      <h3>Éditeur du site</h3>
      <dl>
        <dt>Nom</dt><dd>${esc(L.legalName || "")}</dd>
        <dt>Statut</dt><dd>${esc(L.status || "")}</dd>
        <dt>Adresse</dt><dd>${esc(L.address || "")}</dd>
        <dt>SIRET</dt><dd class="font-mono">${esc(L.siret || "")}</dd>
        <dt>TVA</dt><dd>${esc(L.vat || "")}</dd>
        <dt>Contact</dt><dd><a href="mailto:${mail}">${mail}</a></dd>
        <dt>Directeur de la publication</dt><dd>${esc(L.publicationDirector || L.legalName || "")}</dd>
      </dl>

      <h3>Hébergement</h3>
      <dl>
        <dt>Hébergeur</dt><dd>${esc(H.name || "")}</dd>
        <dt>Adresse</dt><dd>${esc(H.address || "")}</dd>
        ${H.website ? `<dt>Site</dt><dd><a href="${esc(H.website)}" target="_blank" rel="noopener">${esc(H.website.replace(/^https?:\/\//, ""))}</a></dd>` : ""}
      </dl>

      <h3>Propriété intellectuelle</h3>
      <p>L’ensemble des contenus de ce site (textes, études de cas, structure, éléments graphiques) est la propriété exclusive de l’éditeur, sauf mention contraire. Toute reproduction, même partielle, sans autorisation écrite préalable est interdite (articles L.335-2 et suivants du Code de la propriété intellectuelle).</p>

      <h3>Données personnelles (RGPD)</h3>
      <p>Les seules données collectées sont l’adresse email saisie dans le formulaire newsletter et les informations transmises volontairement lors d’une prise de rendez-vous ou d’un échange par email. Elles servent exclusivement à l’envoi de la newsletter et au suivi de votre demande, sur la base de votre consentement (art. 6.1.a RGPD).</p>
      <p>Elles sont conservées jusqu’à votre désinscription, ou 3 ans après le dernier contact. Elles ne sont jamais revendues. Les sous-traitants techniques (outil d’emailing, agenda en ligne) agissent selon leurs propres engagements de conformité.</p>
      <p>Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition et de portabilité : écrivez à <a href="mailto:${mail}">${mail}</a>. Vous pouvez également introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener">cnil.fr</a>).</p>

      <h3>Cookies</h3>
      <p>Ce site n’utilise aucun cookie publicitaire ni outil de mesure d’audience. Aucun bandeau de consentement n’est donc requis. Les polices sont chargées depuis Google Fonts.</p>

      <h3>Responsabilité</h3>
      <p>Les études de cas présentent des systèmes représentatifs ; les gains de temps indiqués dépendent du contexte de chaque organisation et ne constituent pas un engagement de résultat. L’éditeur ne saurait être tenu responsable du contenu des sites externes vers lesquels pointent des liens.</p>`;
  }

  function setupLegal() {
    const modal = $("#legal-modal");
    $("#legal-body").innerHTML = renderLegal();
    $("#open-legal").addEventListener("click", (e) => openModal(modal, e.currentTarget));
    if (location.hash === "#mentions-legales") openModal(modal);
  }

  /* ══════════════ Newsletter ══════════════ */
  function setupNewsletter() {
    const form = $("#newsletter-form");
    const input = $("#nl-email");
    const btn = $("#nl-submit");
    const field = $(".nl-field", form);
    const fb = $("#nl-feedback");
    const label = $(".nl-label", btn);
    const NL = get("newsletter") || {};
    const defaultMsg = fb.textContent;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const setState = (state, msg) => {
      form.classList.remove("is-loading", "is-success");
      field.classList.toggle("is-error", state === "error");
      btn.disabled = state === "loading" || state === "success";
      input.disabled = state === "success";
      if (state === "loading") form.classList.add("is-loading");
      if (state === "success") { form.classList.add("is-success"); label.textContent = "Inscrit ✓"; }
      else label.textContent = "Rejoindre";
      fb.textContent = msg || defaultMsg;
      fb.style.color = state === "error" ? "#FCA5A5" : state === "success" ? "#6EE7B7" : "";
    };

    input.addEventListener("input", () => { if (field.classList.contains("is-error")) setState("idle"); });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (form.website.value) return; // bot
      if (!EMAIL_RE.test(value)) {
        setState("error", "Merci d’indiquer une adresse email valide.");
        input.focus();
        return;
      }
      setState("loading", "Inscription en cours…");

      try {
        if (isPlaceholder(NL.action)) {
          await new Promise((r) => setTimeout(r, 900)); // mode démo
          console.info("[newsletter] Mode démo : renseignez newsletter.action dans config.js.");
        } else {
          const data = new FormData();
          data.append(NL.emailField || "email", value);
          Object.entries(NL.extraFields || {}).forEach(([k, v]) => data.append(k, v));
          // no-cors : compatible avec les formulaires hébergés Brevo / Substack / Mailchimp / Tally
          await fetch(NL.action, { method: NL.method || "POST", body: data, mode: "no-cors" });
        }
        setState("success", "C’est noté. Confirmez votre inscription dans l’email que vous allez recevoir.");
      } catch (err) {
        setState("error", "Connexion impossible pour le moment. Réessayez dans un instant.");
      }
    });
  }

  /* ══════════════ Navigation ══════════════ */
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

    // Lien actif selon la section visible
    if ("IntersectionObserver" in window) {
      const links = $$(".nav-link");
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${en.target.id}`));
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["etudes-de-cas", "offres", "methode"].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ══════════════ Apparition au scroll ══════════════ */
  function setupReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("is-visible"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const siblings = $$(".reveal", en.target.parentElement);
        const i = Math.max(0, siblings.indexOf(en.target));
        en.target.style.transitionDelay = `${Math.min(i, 4) * 60}ms`;
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach((el) => io.observe(el));
  }

  /* ══════════════ Init ══════════════ */
  function init() {
    injectConfig();
    setupNav();
    setupModals();
    setupCases();
    setupBooking();
    setupLegal();
    setupNewsletter();
    setupReveal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
