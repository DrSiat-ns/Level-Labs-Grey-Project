export const HERO_VERSIONS = new Set(["a", "b", "c", "d"]);

const heroSetups = new WeakMap();

export function normalizeHeroVersion(search = "") {
  const value = new URLSearchParams(search).get("hero");
  return HERO_VERSIONS.has(value) ? value : "a";
}

const clearVideo = (video) => {
  video.pause();
  video.removeAttribute("src");
};

const loadVideo = (video) => {
  if (!video.dataset.src) return;
  video.src = video.dataset.src;
  video.addEventListener("loadeddata", () => video.classList.add("is-loaded"), { once: true });
};

const addMotionChangeListener = (motionQuery, listener) => {
  if (typeof motionQuery?.addEventListener === "function") {
    motionQuery.addEventListener("change", listener);
    return () => motionQuery.removeEventListener?.("change", listener);
  }
  if (typeof motionQuery?.addListener === "function") {
    motionQuery.addListener(listener);
    return () => motionQuery.removeListener?.(listener);
  }
  return null;
};

const observeActiveVideo = (state) => {
  const { activeVideo, Observer } = state;
  if (!state.active || state.motionQuery.matches || !activeVideo || !Observer) return;

  state.observer?.disconnect();
  state.observer = new Observer((entries) => {
    if (!state.active || state.motionQuery.matches) return;
    if (entries.some((entry) => entry.isIntersecting)) {
      try {
        activeVideo.play().catch(() => {});
      } catch {}
    } else {
      activeVideo.pause();
    }
  }, { threshold: 0.15 });

  state.observer.observe(activeVideo);
};

const getVideos = (root, panels) => {
  const panelVideos = panels
    .map((panel) => panel.querySelector("[data-hero-video]"))
    .filter(Boolean);
  return [...new Set([...root.querySelectorAll("[data-hero-video]"), ...panelVideos])];
};

const resetPreviousSetup = (root, videos) => {
  const previous = heroSetups.get(root);
  if (previous) {
    previous.active = false;
    previous.observer?.disconnect();
    previous.removeMotionChangeListener?.();
  }

  const videosToClear = previous
    ? new Set([...previous.videos, ...videos])
    : new Set(videos);
  videosToClear.forEach(clearVideo);
};

export function setupHeroVariants(
  root = document,
  search = window.location.search,
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)"),
  Observer = typeof IntersectionObserver === "undefined" ? null : IntersectionObserver,
) {
  const activeVersion = normalizeHeroVersion(search);
  const links = [...root.querySelectorAll("[data-hero-version]")];
  const panels = [...root.querySelectorAll("[data-hero-panel]")];
  const videos = getVideos(root, panels);
  const state = {
    active: true,
    activeVideo: null,
    observer: null,
    Observer,
    motionQuery,
    removeMotionChangeListener: null,
    videos,
  };

  resetPreviousSetup(root, videos);
  heroSetups.set(root, state);

  let activeLinkSelected = false;
  links.forEach((link) => {
    const isActive = !activeLinkSelected && link.dataset.heroVersion === activeVersion;
    if (isActive) activeLinkSelected = true;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  let activePanelSelected = false;
  let activeVideo = null;
  panels.forEach((panel) => {
    const isActive = !activePanelSelected && panel.dataset.heroPanel === activeVersion;
    if (isActive) activePanelSelected = true;
    panel.hidden = !isActive;
    if (isActive) activeVideo = panel.querySelector("[data-hero-video]");
  });

  state.activeVideo = activeVideo;
  if (!activeVideo) return activeVersion;

  state.removeMotionChangeListener = addMotionChangeListener(motionQuery, (event) => {
    if (!state.active) return;
    if (event.matches) {
      state.observer?.disconnect();
      state.observer = null;
      clearVideo(activeVideo);
      return;
    }

    loadVideo(activeVideo);
    observeActiveVideo(state);
  });

  if (!motionQuery.matches) {
    loadVideo(activeVideo);
    observeActiveVideo(state);
  }
  return activeVersion;
}

if (typeof document !== "undefined") {
  setupHeroVariants();
}
