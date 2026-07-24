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

document.querySelectorAll(".hero-glass-screen").forEach((screen) => {
  const glassHeroVideo = screen.querySelector("[data-hero-video]");
  const glassHeroAmbient = screen.querySelector("[data-hero-ambient]");
  if (!(glassHeroVideo instanceof HTMLVideoElement) || !(glassHeroAmbient instanceof HTMLVideoElement)) return;

  const syncAmbientSource = () => {
    const source = glassHeroVideo.getAttribute("src");
    if (!source) {
      glassHeroAmbient.pause();
      glassHeroAmbient.removeAttribute("src");
      glassHeroAmbient.load();
      return false;
    }

    if (glassHeroAmbient.getAttribute("src") !== source) {
      glassHeroAmbient.src = source;
      glassHeroAmbient.load();
    }
    return true;
  };

  const syncAmbientPlayback = () => {
    if (!syncAmbientSource()) return;
    glassHeroAmbient.playbackRate = glassHeroVideo.playbackRate;
    const alignPlayback = () => {
      if (
        Number.isFinite(glassHeroVideo.currentTime)
        && Math.abs(glassHeroAmbient.currentTime - glassHeroVideo.currentTime) > 0.12
      ) {
        glassHeroAmbient.currentTime = glassHeroVideo.currentTime;
      }
    };
    if (glassHeroAmbient.readyState >= HTMLMediaElement.HAVE_METADATA) alignPlayback();
    else glassHeroAmbient.addEventListener("loadedmetadata", alignPlayback, { once: true });
    glassHeroAmbient.play().catch(() => {});
  };

  glassHeroVideo.addEventListener("playing", syncAmbientPlayback);
  glassHeroVideo.addEventListener("seeking", syncAmbientPlayback);
  glassHeroVideo.addEventListener("ratechange", syncAmbientPlayback);
  glassHeroVideo.addEventListener("pause", () => glassHeroAmbient.pause());

  new MutationObserver(syncAmbientSource).observe(glassHeroVideo, {
    attributes: true,
    attributeFilter: ["src"],
  });
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

const selectedHeroVersion = new URLSearchParams(window.location.search).get("hero")?.toLowerCase();
const staticHowSteps = selectedHeroVersion === "e";

if (selectedHeroVersion === "d" && !reduceMotion.matches) {
  const trustSection = document.querySelector("#safety");
  const trustCards = trustSection ? [...trustSection.querySelectorAll(".trust-item")] : [];
  const trustText = trustSection?.querySelector(".feature-text");
  const trustGrid = trustSection?.querySelector(".safety-grid");

  if (trustSection && trustText && trustGrid && trustCards.length) {
    let trustFrame = 0;
    const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
    const smooth = (value) => value * value * (3 - (2 * value));
    const mix = (start, end, amount) => start + ((end - start) * amount);

    const resetTrustCards = () => {
      trustText.style.removeProperty("--trust-pin-y");
      trustGrid.style.removeProperty("--trust-pin-y");
      trustCards.forEach((card) => {
        card.style.removeProperty("--trust-y");
        card.style.removeProperty("--trust-scale");
        card.style.removeProperty("--trust-opacity");
        card.style.removeProperty("--trust-z");
      });
    };

    const updateTrustStack = () => {
      trustFrame = 0;

      if (window.innerWidth <= 900) {
        resetTrustCards();
        return;
      }

      const sectionRect = trustSection.getBoundingClientRect();
      const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--height-header")) || 60;
      const sectionStyles = getComputedStyle(trustSection);
      const paddingTop = parseFloat(sectionStyles.paddingTop) || 0;
      const paddingBottom = parseFloat(sectionStyles.paddingBottom) || 0;
      const baseTop = sectionRect.top + paddingTop;
      const pinElement = (element, targetTop) => {
        const maximum = Math.max(0, sectionRect.height - paddingTop - paddingBottom - element.getBoundingClientRect().height);
        const pinOffset = clamp(targetTop - baseTop, 0, maximum);
        element.style.setProperty("--trust-pin-y", `${pinOffset.toFixed(2)}px`);
      };

      pinElement(trustGrid, headerHeight + (window.innerHeight * 0.11));
      pinElement(trustText, headerHeight + (window.innerHeight * 0.24));

      const scrollRange = Math.max(1, sectionRect.height - window.innerHeight);
      const progress = clamp((headerHeight - sectionRect.top) / scrollRange);
      const cardHeight = trustCards[0].getBoundingClientRect().height;
      const gap = 22;
      const secondStart = cardHeight + gap;
      const thirdStart = (2 * cardHeight) + (2 * gap);
      const firstPhase = smooth(clamp((progress - 0.04) / 0.44));
      const secondPhase = smooth(clamp((progress - 0.46) / 0.44));

      const positions = [
        0,
        mix(secondStart, 18, firstPhase),
        mix(thirdStart, 36, secondPhase),
      ];
      const scales = [
        mix(1, 0.97, firstPhase),
        mix(1, 0.985, secondPhase),
        1,
      ];
      const opacities = [
        mix(1, 0.62, firstPhase),
        mix(1, 0.8, secondPhase),
        1,
      ];

      trustCards.forEach((card, index) => {
        card.style.setProperty("--trust-y", `${positions[index].toFixed(2)}px`);
        card.style.setProperty("--trust-scale", scales[index].toFixed(3));
        card.style.setProperty("--trust-opacity", opacities[index].toFixed(3));
        card.style.setProperty("--trust-z", String(index + 1));
      });
    };

    const scheduleTrustStack = () => {
      if (trustFrame) return;
      trustFrame = requestAnimationFrame(updateTrustStack);
    };

    window.addEventListener("scroll", scheduleTrustStack, { passive: true });
    window.addEventListener("resize", scheduleTrustStack);
    updateTrustStack();
  }
}

document.querySelectorAll(".flip-card").forEach((card) => {
  if (staticHowSteps && card.classList.contains("how-step")) {
    card.classList.remove("is-flipped");
    card.removeAttribute("tabindex");
    card.removeAttribute("role");
    card.removeAttribute("aria-pressed");
    card.removeAttribute("aria-label");
    return;
  }

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

const growCarousel = document.querySelector("[data-grow-carousel]");
if (growCarousel) {
  const slides = [...growCarousel.querySelectorAll("[data-grow-slide]")];
  const dots = [...growCarousel.querySelectorAll("[data-grow-dot]")];
  const nodes = [...growCarousel.querySelectorAll("[data-grow-node-e]")];
  const previousButton = growCarousel.querySelector("[data-grow-prev]");
  const nextButton = growCarousel.querySelector("[data-grow-next]");
  let activeSlide = 0;

  const showGrowSlide = (requestedSlide) => {
    activeSlide = (requestedSlide + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeSlide;
      slide.hidden = !isActive;
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, index) => {
      if (index === activeSlide) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    nodes.forEach((node, index) => {
      node.classList.toggle("is-active", index === activeSlide);
    });

    growCarousel.dataset.activeSlide = String(activeSlide);
  };

  previousButton?.addEventListener("click", () => showGrowSlide(activeSlide - 1));
  nextButton?.addEventListener("click", () => showGrowSlide(activeSlide + 1));
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showGrowSlide(index));
  });

  growCarousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showGrowSlide(activeSlide - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showGrowSlide(activeSlide + 1);
    }
  });

  showGrowSlide(0);
}

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
