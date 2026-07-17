import test from "node:test";
import assert from "node:assert/strict";
import { normalizeHeroVersion, setupHeroVariants } from "../hero-variants.mjs";

const createClassList = () => {
  const classes = new Set();
  return {
    contains: (name) => classes.has(name),
    toggle: (name, enabled) => {
      if (enabled) classes.add(name);
      else classes.delete(name);
    },
  };
};

const createVideo = (src, { rejectsPlay = false } = {}) => {
  const attributes = new Map();
  return {
    dataset: { src },
    classList: createClassList(),
    pauseCalls: 0,
    playCalls: 0,
    addEventListener() {},
    getAttribute: (name) => attributes.get(name) ?? null,
    hasAttribute: (name) => attributes.has(name),
    removeAttribute(name) {
      attributes.delete(name);
      if (name === "src") this.src = "";
    },
    pause() {
      this.pauseCalls += 1;
    },
    play() {
      this.playCalls += 1;
      return rejectsPlay ? Promise.reject(new Error("blocked")) : Promise.resolve();
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
    set src(value) {
      if (value) attributes.set("src", value);
      else attributes.delete("src");
    },
    get src() {
      return attributes.get("src") ?? "";
    },
  };
};

const createLink = (version) => {
  const attributes = new Map();
  return {
    dataset: { heroVersion: version },
    classList: createClassList(),
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
  };
};

const createPanel = (version, video) => ({
  dataset: { heroPanel: version },
  hidden: false,
  querySelector: (selector) => selector === "[data-hero-video]" ? video : null,
  video,
});

const createRoot = ({ links, panels }) => ({
  querySelectorAll(selector) {
    if (selector === "[data-hero-version]") return links;
    if (selector === "[data-hero-panel]") return panels;
    if (selector === "[data-hero-video]") return panels.map((panel) => panel.video);
    return [];
  },
});

const createObserver = () => {
  const instances = [];
  class FakeObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.disconnectCalls = 0;
      instances.push(this);
    }

    observe(target) {
      this.target = target;
    }

    disconnect() {
      this.disconnectCalls += 1;
    }

    emit(isIntersecting) {
      this.callback([{ isIntersecting }]);
    }
  }
  return { FakeObserver, instances };
};

const createMotionQuery = ({ matches = false, legacy = false } = {}) => {
  const listeners = new Set();
  const add = (listener) => listeners.add(listener);
  const remove = (listener) => listeners.delete(listener);
  return {
    matches,
    ...(legacy
      ? { addListener: add, removeListener: remove }
      : { addEventListener: (type, listener) => type === "change" && add(listener), removeEventListener: (type, listener) => type === "change" && remove(listener) }),
    emit(nextMatches) {
      this.matches = nextMatches;
      listeners.forEach((listener) => listener({ matches: nextMatches }));
    },
    listenerCount: () => listeners.size,
  };
};

const withObserver = (Observer, action) => {
  const previous = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = Observer;
  try {
    return action();
  } finally {
    if (previous === undefined) delete globalThis.IntersectionObserver;
    else globalThis.IntersectionObserver = previous;
  }
};

const createHero = (options = {}) => {
  const versions = options.versions ?? ["a", "b", "c"];
  const videos = versions.map((version) => createVideo(`/${version}.mp4`, options.videoOptions?.[version]));
  return {
    links: versions.map(createLink),
    panels: versions.map((version, index) => createPanel(version, videos[index])),
    videos,
  };
};

test("hero query accepts a, b, and c", () => {
  assert.equal(normalizeHeroVersion("?hero=a"), "a");
  assert.equal(normalizeHeroVersion("?hero=b"), "b");
  assert.equal(normalizeHeroVersion("?hero=c"), "c");
});

test("hero query defaults unsupported and missing values to a", () => {
  assert.equal(normalizeHeroVersion(""), "a");
  assert.equal(normalizeHeroVersion("?hero=z"), "a");
  assert.equal(normalizeHeroVersion("?other=b"), "a");
  assert.equal(normalizeHeroVersion("?hero=B"), "a");
});

test("setup selects only the first matching panel and version link", () => {
  const hero = createHero({ versions: ["a", "b", "b", "c"] });
  const root = createRoot(hero);

  setupHeroVariants(root, "?hero=b", { matches: false }, null);

  assert.equal(hero.links.filter((link) => link.classList.contains("active")).length, 1);
  assert.equal(hero.links.filter((link) => link.getAttribute("aria-current") === "page").length, 1);
  assert.equal(hero.links[1].classList.contains("active"), true);
  assert.equal(hero.links[2].classList.contains("active"), false);
  assert.equal(hero.panels.filter((panel) => !panel.hidden).length, 1);
  assert.equal(hero.panels[1].hidden, false);
  assert.equal(hero.panels[2].hidden, true);
  assert.equal(hero.videos[1].src, "/b.mp4");
  assert.equal(hero.videos[2].src, "");
});

test("setup loads only the active video and clears inactive sources", () => {
  const hero = createHero();
  const root = createRoot(hero);
  hero.videos[0].src = "/stale-a.mp4";
  hero.videos[2].src = "/stale-c.mp4";

  setupHeroVariants(root, "?hero=b", { matches: false }, null);

  assert.equal(hero.videos[0].src, "");
  assert.equal(hero.videos[1].src, "/b.mp4");
  assert.equal(hero.videos[2].src, "");
  assert.equal(hero.videos[0].pauseCalls, 1);
  assert.equal(hero.videos[2].pauseCalls, 1);
});

test("repeated setup clears old media and disconnects its observer", () => {
  const hero = createHero();
  const root = createRoot(hero);
  const observer = createObserver();

  withObserver(observer.FakeObserver, () => {
    setupHeroVariants(root, "?hero=a", { matches: false });
    observer.instances[0].emit(true);
    setupHeroVariants(root, "?hero=b", { matches: false });
    observer.instances[0].emit(true);
  });

  assert.equal(observer.instances[0].disconnectCalls, 1);
  assert.equal(hero.videos[0].src, "");
  assert.equal(hero.videos[0].pauseCalls, 2);
  assert.equal(hero.videos[0].playCalls, 1);
  assert.equal(hero.videos[1].src, "/b.mp4");
  assert.equal(observer.instances[1].target, hero.videos[1]);
});

test("reduced motion clears previous media and creates no observer", () => {
  const hero = createHero();
  const root = createRoot(hero);
  const observer = createObserver();

  withObserver(observer.FakeObserver, () => {
    setupHeroVariants(root, "?hero=a", { matches: false });
    setupHeroVariants(root, "?hero=b", { matches: true });
  });

  assert.equal(observer.instances.length, 1);
  assert.equal(observer.instances[0].disconnectCalls, 1);
  assert.equal(hero.videos.every((video) => video.src === ""), true);
  assert.equal(hero.videos.every((video) => video.pauseCalls >= 1), true);
});

test("live reduced-motion changes clear and restore only the active video", () => {
  const hero = createHero();
  const root = createRoot(hero);
  const observer = createObserver();
  const motionQuery = createMotionQuery();

  withObserver(observer.FakeObserver, () => {
    setupHeroVariants(root, "?hero=b", motionQuery);
    observer.instances[0].emit(true);
    motionQuery.emit(true);
    const playCallsBeforeStaleEntry = hero.videos[1].playCalls;
    observer.instances[0].emit(true);

    assert.equal(observer.instances[0].disconnectCalls, 1);
    assert.equal(hero.videos[1].src, "");
    assert.equal(hero.videos[1].pauseCalls, 2);
    assert.equal(hero.videos[1].playCalls, playCallsBeforeStaleEntry);

    motionQuery.emit(false);
  });

  assert.equal(hero.videos[0].src, "");
  assert.equal(hero.videos[1].src, "/b.mp4");
  assert.equal(hero.videos[2].src, "");
  assert.equal(observer.instances.length, 2);
  assert.equal(observer.instances[1].target, hero.videos[1]);
});

test("repeated setup removes the old legacy reduced-motion listener", () => {
  const hero = createHero();
  const root = createRoot(hero);
  const firstMotionQuery = createMotionQuery({ legacy: true });
  const secondMotionQuery = createMotionQuery({ legacy: true });

  setupHeroVariants(root, "?hero=a", firstMotionQuery, null);
  setupHeroVariants(root, "?hero=b", secondMotionQuery, null);

  assert.equal(firstMotionQuery.listenerCount(), 0);
  assert.equal(secondMotionQuery.listenerCount(), 1);
  firstMotionQuery.emit(true);
  assert.equal(hero.videos[1].src, "/b.mp4");
});

test("setup safely skips observation when IntersectionObserver is unavailable", () => {
  const hero = createHero();
  const root = createRoot(hero);

  assert.equal(setupHeroVariants(root, "?hero=c", { matches: false }, null), "c");
  assert.equal(hero.videos[2].src, "/c.mp4");
});

test("playback rejection is swallowed and offscreen video pauses", async () => {
  const hero = createHero({ videoOptions: { a: { rejectsPlay: true } } });
  const root = createRoot(hero);
  const observer = createObserver();

  withObserver(observer.FakeObserver, () => {
    setupHeroVariants(root, "?hero=a", { matches: false });
    observer.instances[0].emit(true);
  });
  await Promise.resolve();
  observer.instances[0].emit(false);

  assert.equal(hero.videos[0].playCalls, 1);
  assert.equal(hero.videos[0].pauseCalls, 2);
});
