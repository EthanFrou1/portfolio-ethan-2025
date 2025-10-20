(function () {
  emailjs.init("ZhjidNaCZiF2Ul7qi");
})();

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      emailjs.sendForm("service_22u3f7i", "template_xvh42ag", this).then(
        function () {
          showModal(true);
          form.reset();
        },
        function (error) {
          showModal(false);
          console.error(error);
        }
      );
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
  const mobileMenu  = document.getElementById("mobile-menu");     // <nav id="mobile-menu" ... translate-x-full>
  const mobileClose = document.getElementById("mobile-close");     // bouton X dans le drawer
  const overlay     = document.getElementById("mobile-overlay");   // <div id="mobile-overlay" ... hidden>
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

    // Bouton X du drawer
    mobileClose && mobileClose.addEventListener("click", closeMenu);

    // Clic sur l’overlay
    overlay && overlay.addEventListener("click", closeMenu);

    // Fermer au clic sur un lien du menu
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });

    // Fermer avec la touche Échap
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }
});

// -------- Modale --------
function showModal(success = true) {
  const modal = document.getElementById("modal-message");
  const title = document.getElementById("modal-title");
  const text = document.getElementById("modal-text");

  if (success) {
    title.textContent = "Message envoyé ✅";
    text.textContent = "Merci pour votre message, je vous répondrai rapidement.";
  } else {
    title.textContent = "Erreur ❌";
    text.textContent = "Une erreur est survenue, veuillez réessayer.";
  }

  modal.classList.remove("hidden");

  // Fermeture automatique au bout de 5 secondes
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