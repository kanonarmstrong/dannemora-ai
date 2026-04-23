(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = btn.getAttribute("data-copy");
      const el = target ? document.querySelector(target) : null;
      const text = el ? el.textContent.trim() : btn.getAttribute("data-copy-text");
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = prev;
        }, 2000);
      } catch {
        btn.textContent = "Copy failed";
        setTimeout(() => {
          btn.textContent = "Copy to clipboard";
        }, 2000);
      }
    });
  });

  const navToggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }

  const searchInput = $("#docs-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      document.querySelectorAll("[data-doc-item]").forEach((item) => {
        const hay = item.textContent.toLowerCase();
        item.style.display = !q || hay.includes(q) ? "" : "none";
      });
    });
  }

  const cancelBtn = $("#cancel-subscription-btn");
  const modal = $("#cancel-modal");
  const modalClose = $("#cancel-modal-close");
  const modalDismiss = $("#cancel-modal-dismiss");

  function openModal() {
    if (modal) modal.classList.add("is-open");
  }

  function closeModal() {
    if (modal) modal.classList.remove("is-open");
  }

  if (cancelBtn) cancelBtn.addEventListener("click", openModal);
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalDismiss) modalDismiss.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  const regenBtn = $("#regenerate-key-btn");
  if (regenBtn) {
    regenBtn.addEventListener("click", () => {
      const ok = window.confirm(
        "Regenerate your license key? The old key will stop working immediately for any running agents."
      );
      if (ok) {
        window.alert(
          "Demo only: connect your backend to issue a new key and persist it to Stripe metadata."
        );
      }
    });
  }

  const magicForm = $("#magic-link-form");
  if (magicForm) {
    magicForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("#signin-email")?.value?.trim();
      if (!email) return;
      window.alert(
        `Demo: we would email a magic link to ${email}. Wire this form to your auth provider.`
      );
    });
  }

  const billingToggles = document.querySelectorAll("[data-billing-toggle]");
  if (billingToggles.length) {
    const tierEl = $("#pricing-tier");
    const amountEl = $("#pricing-amount");
    const noteEl = $("#pricing-note");
    const savingsBadgeEl = $("#pricing-savings-badge");
    const subscribeLinkEl = $("#pricing-subscribe-link");
    const featuresEl = $("#pricing-features");

    const plans = {
      monthly: {
        tier: "Monthly",
        amountHtml: '<span class="price-card__primary-amount">$59</span><span style="font-size: 1rem; font-weight: 500">/mo</span>',
        note: "Monthly is higher cost. Switch to annual to save about $200/year for the same features.",
        savingsLabel: "Save ~$200/year by switching to annual",
        checkoutUrl: "https://buy.stripe.com/checkout-placeholder-monthly",
        features: ["Same stuff. You'll just pay more over time."],
      },
      annual: {
        tier: "Annual",
        amountHtml:
          '<span class="price-card__primary-amount price-card__primary-amount--glow">$42</span><span style="font-size: 1rem; font-weight: 500">/mo</span><span class="price-card__billing">$499 billed annually</span>',
        note: "Lowest effective monthly price for the same full feature set.",
        savingsLabel: "Best value: save ~$200/year on annual",
        checkoutUrl: "https://buy.stripe.com/checkout-placeholder-annual",
        features: [
          "3 autonomous agents (TL, Dev, QA)",
          "Secure durable message bus",
          "Hardened security layer",
          "Monitoring dashboard",
          "Telegram bot integration",
          "All future updates",
        ],
      },
    };

    function setPlan(planKey) {
      const plan = plans[planKey];
      if (!plan || !tierEl || !amountEl || !noteEl || !savingsBadgeEl || !subscribeLinkEl) return;

      tierEl.textContent = plan.tier;
      amountEl.innerHTML = plan.amountHtml;
      noteEl.textContent = plan.note;
      savingsBadgeEl.textContent = plan.savingsLabel;
      subscribeLinkEl.href = plan.checkoutUrl;
      if (featuresEl) {
        featuresEl.innerHTML = (plan.features || [])
          .map((item) => `<li>${item}</li>`)
          .join("");
      }

      billingToggles.forEach((btn) => {
        const isActive = btn.getAttribute("data-billing-toggle") === planKey;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    billingToggles.forEach((btn) => {
      btn.addEventListener("click", () => setPlan(btn.getAttribute("data-billing-toggle")));
    });

    // Default to annual so users see the lowest effective monthly price first.
    setPlan("annual");
  }

  function setupHomepageRevealAnimations() {
    const hero = document.querySelector(".hero");
    const agentsSection = document.querySelector("#agents");
    if (!hero || !agentsSection) return;

    document.body.classList.add("animate-home");

    const heroItems = hero.querySelectorAll(".eyebrow, h1, .body-large, .get-started-cta, .hero__visual");
    heroItems.forEach((el, index) => {
      el.setAttribute("data-hero-item", "");
      el.style.setProperty("--hero-load-index", index.toString());
    });

    const revealSections = document.querySelectorAll("main > section:not(.hero)");
    const staggerSelector =
      ".eyebrow, h1, h2, h3, h4, h5, h6, p, .feature-badge, .step-card__num, li, .btn, .card, pre";
    const rootStyles = getComputedStyle(document.documentElement);
    const parseTimeToSeconds = (value, fallback) => {
      if (!value) return fallback;
      const normalized = value.trim();
      if (normalized.endsWith("ms")) {
        const parsed = Number.parseFloat(normalized.replace("ms", ""));
        return Number.isFinite(parsed) ? parsed / 1000 : fallback;
      }
      if (normalized.endsWith("s")) {
        const parsed = Number.parseFloat(normalized.replace("s", ""));
        return Number.isFinite(parsed) ? parsed : fallback;
      }
      const parsed = Number.parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const staggerStartSeconds = parseTimeToSeconds(rootStyles.getPropertyValue("--reveal-stagger-start"), 1);
    const staggerStepSeconds = parseTimeToSeconds(rootStyles.getPropertyValue("--reveal-stagger-step"), 0.2);

    revealSections.forEach((section) => {
      section.setAttribute("data-reveal", "");
      const staggerItems = section.querySelectorAll(staggerSelector);
      staggerItems.forEach((item, index) => {
        item.setAttribute("data-stagger-item", "");
        item.style.setProperty("--stagger-index", index.toString());
      });
    });

    requestAnimationFrame(() => {
      document.body.classList.add("is-loaded");
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealSections.forEach((section) => observer.observe(section));

    const roleImages = document.querySelectorAll(".role-image-reveal");
    roleImages.forEach((img) => {
      const imageSection = img.closest(".feature-row");
      const sectionStaggerItems = imageSection ? imageSection.querySelectorAll(staggerSelector) : [];
      const imageDelaySeconds = staggerStartSeconds + sectionStaggerItems.length * staggerStepSeconds;
      img.style.setProperty("--image-reveal-delay", `${imageDelaySeconds.toFixed(3)}s`);
    });

    const imageObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
      }
    );

    roleImages.forEach((img) => imageObserver.observe(img));
  }

  setupHomepageRevealAnimations();
})();
