(function () {
    emailjs.init("ZhjidNaCZiF2Ul7qi");
})();

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            emailjs.sendForm("service_22u3f7i", "template_xvh42ag", this)
                .then(function () {
                    showModal(true);
                    form.reset();
                }, function (error) {
                    showModal(false);
                    console.error(error);
                });
        });
    }

    // Animation des éléments au chargement
    document.querySelectorAll(".fade-in").forEach(el => {
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
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

    // Burger menu toggle + click-outside handler
    const btn = document.getElementById("burger-btn");
    const menu = document.getElementById("mobile-menu");

    if (btn && menu) {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            const isClickInside = btn.contains(e.target) || menu.contains(e.target);
            if (!isClickInside && !menu.classList.contains("hidden")) {
                menu.classList.add("hidden");
            }
        });

        const links = menu.querySelectorAll("a");
        links.forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.add("hidden");
            });
        });
    }
});

// Fonction pour afficher la modale
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

// Fonction pour fermer la modale
function closeModal() {
    const modal = document.getElementById("modal-message");
    modal.classList.add("opacity-0", "transition-opacity", "duration-300");

    setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("opacity-0");
    }, 300);
}