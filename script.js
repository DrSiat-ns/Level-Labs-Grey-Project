const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-scroll-target]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.getElementById(link.dataset.scrollTarget);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  });
});

document.querySelectorAll("[data-media-fallback]").forEach((media) => {
  if (media instanceof HTMLVideoElement) {
    const markLoaded = () => media.classList.add("is-loaded");
    if (media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markLoaded();
    } else {
      media.addEventListener("loadeddata", markLoaded, { once: true });
    }
  }

  media.addEventListener("error", () => {
    media.hidden = true;
    media.closest(".feature-media")?.classList.add("is-fallback");
  }, { once: true });
});

document.querySelectorAll("[data-hover-video]").forEach((card) => {
  const media = card.querySelector(".play-card-media");
  const video = card.querySelector(".play-card-live");
  if (!media || !(video instanceof HTMLVideoElement)) return;

  let activation = 0;
  const isActive = () => card.matches(":hover") || card.matches(":focus-within");

  const stop = () => {
    activation += 1;
    video.pause();
    video.currentTime = 0;
    media.classList.remove("is-video-active");
  };

  const start = () => {
    activation += 1;
    const token = activation;
    media.classList.add("is-video-active");
    const playWhenReady = () => {
      if (token !== activation || !isActive()) return;
      video.play().catch(() => {});
    };
    video.addEventListener("canplay", playWhenReady, { once: true });
    video.load();
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) playWhenReady();
  };

  card.addEventListener("pointerenter", start);
  card.addEventListener("pointerleave", () => {
    if (!card.matches(":focus-within")) stop();
  });
  card.addEventListener("focusin", start);
  card.addEventListener("focusout", () => {
    requestAnimationFrame(() => {
      if (!isActive()) stop();
    });
  });
});

const revealItems = document.querySelectorAll(".reveal");
if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10%", threshold: 0.08 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll(".flip-card").forEach((card) => {
  const toggle = () => {
    const isFlipped = card.classList.toggle("is-flipped");
    if (card.hasAttribute("aria-pressed")) {
      card.setAttribute("aria-pressed", String(isFlipped));
    }
  };
  card.addEventListener("click", toggle);
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle();
  });
});

const themeToggle = document.querySelector("[data-theme-toggle]");
if (themeToggle) {
  const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    const nextTheme = theme === "dark" ? "light" : "dark";
    themeToggle.setAttribute("aria-label", `Use ${nextTheme} theme`);
    themeToggle.setAttribute("title", `Use ${nextTheme} theme`);
  };

  let storedTheme = "dark";
  try {
    storedTheme = window.localStorage.getItem("level-lab-theme") || "dark";
  } catch {
    storedTheme = "dark";
  }
  setTheme(storedTheme);

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      window.localStorage.setItem("level-lab-theme", nextTheme);
    } catch {
      // The visual change still works when storage is unavailable.
    }
  });
}
