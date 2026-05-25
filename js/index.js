document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = document.getElementById("contact-submit");
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours…";

      // Token Turnstile auto-injecté par le widget dans le champ cf-turnstile-response
      const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
      const turnstileToken = turnstileInput ? turnstileInput.value : "";

      const payload = {
        user_name: (form.querySelector('[name="user_name"]')?.value || "").trim(),
        user_email: (form.querySelector('[name="user_email"]')?.value || "").trim(),
        message: (form.querySelector('[name="message"]')?.value || "").trim(),
        website: form.querySelector('[name="website"]')?.value || "", // honeypot
        "cf-turnstile-response": turnstileToken,
      };

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (res.ok && result.success) {
          showModal(true);
          form.reset();
          if (window.turnstile) turnstile.reset();
        } else {
          showModal(false, result.error);
        }
      } catch (err) {
        console.error("Contact fetch error:", err);
        showModal(false, "Erreur réseau, veuillez réessayer.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // Animation des éléments au chargement
  document.querySelectorAll(".fade-in").forEach((el) => {
    setTimeout(() => {
      el.classList.add("visible");
    }, 100);
  });

  // Initialisation AOS
  AOS.init({
    duration: 800,
    once: true,
  });

  // Smooth scroll avec animation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.classList.add("animate-pulse");
        target.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => target.classList.remove("animate-pulse"), 800);
      }
    });
  });

  // ===== Drawer mobile (depuis la droite) =====
  const burgerBtn   = document.getElementById("burger-btn");
  const mobileMenu  = document.getElementById("mobile-menu");
  const mobileClose = document.getElementById("mobile-close");
  const overlay     = document.getElementById("mobile-overlay");
  const body        = document.body;

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("translate-x-full");
    overlay && overlay.classList.remove("hidden");
    body.classList.add("overflow-hidden");
    burgerBtn && burgerBtn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("translate-x-full");
    overlay && overlay.classList.add("hidden");
    body.classList.remove("overflow-hidden");
    burgerBtn && burgerBtn.setAttribute("aria-expanded", "false");
  }

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (mobileMenu.classList.contains("translate-x-full")) openMenu();
      else closeMenu();
    });

    mobileClose && mobileClose.addEventListener("click", closeMenu);
    overlay && overlay.addEventListener("click", closeMenu);

    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }
});

// -------- Modale --------
function showModal(success = true, errorMsg = null) {
  const modal = document.getElementById("modal-message");
  const title = document.getElementById("modal-title");
  const text  = document.getElementById("modal-text");

  if (success) {
    title.textContent = "Message envoyé ✅";
    text.textContent  = "Merci pour votre message, je vous répondrai rapidement.";
  } else {
    title.textContent = "Erreur ❌";
    text.textContent  = errorMsg || "Une erreur est survenue, veuillez réessayer.";
  }

  modal.classList.remove("hidden");

  setTimeout(() => {
    closeModal();
  }, 5000);
}

function closeModal() {
  const modal = document.getElementById("modal-message");
  modal.classList.add("opacity-0", "transition-opacity", "duration-300");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("opacity-0");
  }, 300);
}
