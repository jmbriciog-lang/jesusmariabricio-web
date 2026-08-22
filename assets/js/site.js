(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Menú móvil -----------------------------------------------------
  const toggle = document.querySelector(".site-nav__toggle");
  const links = document.getElementById("site-nav-links");

  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("is-open");
  }
  function openMenu() {
    toggle.setAttribute("aria-expanded", "true");
    links.classList.add("is-open");
  }

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });
    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (e) => {
      if (!links.classList.contains("is-open")) return;
      if (links.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu();
    });
  }

  // --- Scroll-spy -------------------------------------------------------
  const navLinks = Array.from(document.querySelectorAll(".site-nav__links a"));
  const sections = navLinks
    .map((a) => {
      const href = a.getAttribute("href") || "";
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return null;
      try {
        return document.querySelector(href.slice(hashIndex));
      } catch (err) {
        return null;
      }
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach((a) => {
            a.classList.toggle("is-active", a.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // --- Scroll-reveal ------------------------------------------------------
  const revealEls = document.querySelectorAll(".reveal");

  if (!revealEls.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
})();
