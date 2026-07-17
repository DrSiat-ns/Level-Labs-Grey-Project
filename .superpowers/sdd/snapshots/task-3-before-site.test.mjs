import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(resolve(root, relativePath), "utf8");

const countMatches = (value, pattern) => (value.match(pattern) || []).length;

const getHeroPanelBlocks = (html) => {
  const heroSectionMatch = html.match(
    /<section\b(?=[^>]*\sid="welcome")[^>]*>[\s\S]*?<\/section>/,
  );
  assert.ok(heroSectionMatch, "missing welcome hero section");

  const heroSection = heroSectionMatch[0];
  const versions = ["a", "b", "c"];
  const markerIndexes = versions.map((version) => {
    const markerPattern = new RegExp(`\\sdata-hero-panel="${version}"`, "g");
    const markerMatches = [...heroSection.matchAll(markerPattern)];
    assert.equal(
      markerMatches.length,
      1,
      `expected exactly one hero panel ${version}`,
    );
    return markerMatches[0].index + markerMatches[0][0].indexOf("data-hero-panel");
  });

  return versions.map((version, index) => {
    const start = markerIndexes[index];
    const end = index < versions.length - 1
      ? markerIndexes[index + 1]
      : heroSection.lastIndexOf("</section>");
    assert.ok(end > start, `could not bound hero panel ${version}`);

    const openingTagStart = heroSection.lastIndexOf("<", start);
    const openingTagEnd = heroSection.indexOf(">", start);
    assert.ok(
      openingTagStart >= 0 && openingTagEnd > start,
      `could not read opening tag for hero panel ${version}`,
    );

    return {
      version,
      block: heroSection.slice(start, end),
      openingTag: heroSection.slice(openingTagStart, openingTagEnd + 1),
    };
  });
};

const getBalancedBlock = (source, openingBraceIndex, label) => {
  let depth = 0;
  for (let index = openingBraceIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] !== "}") continue;
    depth -= 1;
    if (depth === 0) return source.slice(openingBraceIndex, index + 1);
  }
  assert.fail(`missing closing brace for ${label}`);
};

test("the homepage is a self-contained static entry point", async () => {
  const html = await read("index.html");
  assert.match(html, /<link[^>]+href="styles\.css"/);
  assert.match(html, /<script[^>]+src="script\.js"/);
  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/);
});

test("homepage preserves the staging information architecture", async () => {
  const html = await read("index.html");
  for (const id of ["welcome", "build", "play", "learn", "safety"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const heading of [
    "Make a game. Make it yours.",
    "Your idea. Playable in minutes.",
    "Imagine it. Build it. Remix everything.",
    "Build the experience",
    "Play is just the beginning",
    "Games grow. So do you.",
    "Safe by design",
  ]) {
    assert.ok(html.includes(heading), `missing heading: ${heading}`);
  }
});

test("homepage exposes three shareable hero versions and defaults to A", async () => {
  const html = await read("index.html");
  const primaryNavMatch = html.match(
    /<nav\b(?=[^>]*\saria-label="Primary navigation")[^>]*>[\s\S]*?<\/nav>/,
  );
  assert.ok(primaryNavMatch, "missing Primary navigation block");
  const primaryNav = primaryNavMatch[0];
  const orderedLinks = [
    {
      label: "Home",
      pattern: /<a\b(?=[^>]*\sid="nav-home")(?=[^>]*\shref="index\.html")[^>]*>\s*Home\s*<\/a>/,
    },
    {
      label: "Build",
      pattern: /<a\b(?=[^>]*\sid="nav-build")(?=[^>]*\shref="build\.html")[^>]*>\s*Build\s*<\/a>/,
    },
    {
      label: "Play",
      pattern: /<a\b(?=[^>]*\sid="nav-play")(?=[^>]*\shref="play\.html")[^>]*>\s*Play\s*<\/a>/,
    },
    {
      label: "Version A",
      pattern: /<a\b(?=[^>]*\shref="index\.html\?hero=a")(?=[^>]*\saria-label="Version A")[^>]*>\s*<span class="version-word">Version <\/span>A\s*<\/a>/,
    },
    {
      label: "Version B",
      pattern: /<a\b(?=[^>]*\shref="index\.html\?hero=b")(?=[^>]*\saria-label="Version B")[^>]*>\s*<span class="version-word">Version <\/span>B\s*<\/a>/,
    },
    {
      label: "Version C",
      pattern: /<a\b(?=[^>]*\shref="index\.html\?hero=c")(?=[^>]*\saria-label="Version C")[^>]*>\s*<span class="version-word">Version <\/span>C\s*<\/a>/,
    },
  ];
  let previousIndex = -1;
  for (const { label, pattern } of orderedLinks) {
    const linkMatch = primaryNav.match(pattern);
    assert.ok(linkMatch, `missing ${label} link in Primary navigation`);
    assert.ok(linkMatch.index > previousIndex, `${label} link is out of order in Primary navigation`);
    previousIndex = linkMatch.index;
  }

  for (const { version, block, openingTag } of getHeroPanelBlocks(html)) {
    if (version === "a") {
      assert.doesNotMatch(openingTag, /\shidden(?:\s|=|>)/, "hero panel a must be visible by default");
    } else {
      assert.match(openingTag, /\shidden(?:\s|=|>)/, `hero panel ${version} must be hidden by default`);
    }
    assert.equal(
      countMatches(block, /\sdata-src="assets\/media\/welcome\.mp4"/g),
      1,
      `hero panel ${version} must contain exactly one lazy welcome video source`,
    );
    assert.equal(
      countMatches(block, /\sdata-hero-video(?:\s|=|>)/g),
      1,
      `hero panel ${version} must contain exactly one data-hero-video attribute`,
    );
    assert.doesNotMatch(
      block,
      /<(?:video|source)\b[^>]*\ssrc\s*=/i,
      `hero panel ${version} must not eagerly load a video or source element`,
    );
  }
  assert.match(html, /<script type="module" src="hero-variants\.mjs"><\/script>/);
});

test("each hero version keeps the approved actions and accessible labels", async () => {
  const html = await read("index.html");
  for (const { version, block } of getHeroPanelBlocks(html)) {
    assert.equal(
      countMatches(
        block,
        /<a\b(?=[^>]*\shref="build\.html")[^>]*>\s*Start Creating\s*<\/a>/g,
      ),
      1,
      `hero panel ${version} must contain one Start Creating link to build.html`,
    );
    assert.equal(
      countMatches(
        block,
        /<a\b(?=[^>]*\shref="play\.html")(?=[^>]*\saria-label="Play games")[^>]*>\s*Play\s*<\/a>/g,
      ),
      1,
      `hero panel ${version} must contain one labeled Play link to play.html`,
    );
  }
});

test("primary actions use local destinations", async () => {
  const html = await read("index.html");
  assert.match(html, /href="build\.html"/);
  assert.match(html, /href="play\.html"/);
  assert.match(html, /href="sign-in\.html"/);
  assert.match(html, /href="#build"[^>]*data-scroll-target="build"/);
});

test("styles preserve Level Lab tokens and required responsive states", async () => {
  const css = await read("styles.css");
  for (const value of ["#1a1a1a", "#252525", "#3a3a3a", "#e5e5e5", "#0077ff"]) {
    assert.ok(css.includes(value), `missing Level Lab color ${value}`);
  }
  assert.match(css, /--grid-unit:\s*5px/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.nav-version\s*\{[^}]*min-height:\s*44px/s);
  assert.match(css, /\.hero-actions \.button\s*\{[^}]*height:\s*44px/s);
  const responsiveMediaDeclarations = [
    ...css.matchAll(/@media\s*\(max-width:\s*768px\)\s*\{/g),
  ];
  const responsiveBlocks = responsiveMediaDeclarations.map((match, index) => {
    const openingBraceIndex = match.index + match[0].lastIndexOf("{");
    return getBalancedBlock(css, openingBraceIndex, `768px media block ${index + 1}`);
  });
  assert.ok(
    responsiveBlocks.some((block) => /\.version-word\s*\{[^}]*display:\s*none/s.test(block)),
    ".version-word must be hidden inside an @media (max-width: 768px) block",
  );
});

test("local destination pages are present and return home", async () => {
  for (const page of ["build.html", "play.html", "sign-in.html"]) {
    const html = await read(page);
    assert.match(html, /href="index\.html"/);
    assert.match(html, /class="placeholder-page"/);
  }
});

test("homepage behavior is progressively enhanced", async () => {
  const js = await read("script.js");
  assert.match(js, /data-scroll-target/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /data-media-fallback/);
  assert.match(js, /data-theme-toggle/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /is-loaded/);
});

test("required visual assets are local", async () => {
  const html = await read("index.html");
  assert.doesNotMatch(html, /(?:src|poster)="https?:\/\//);
  await Promise.all([
    readFile(resolve(root, "assets/media/background-dark.jpg")),
    readFile(resolve(root, "assets/media/background-light.jpg")),
    readFile(resolve(root, "assets/media/welcome.mp4")),
    readFile(resolve(root, "assets/media/splash-build-1080.mp4")),
    readFile(resolve(root, "assets/media/splash-play-1080.mp4")),
    readFile(resolve(root, "assets/images/grow.png")),
    readFile(resolve(root, "assets/images/trust.png")),
    readFile(resolve(root, "assets/icons/level-lab-mark.svg")),
    readFile(resolve(root, "assets/fonts/roboto-300.woff2")),
    readFile(resolve(root, "assets/fonts/roboto-700.woff2")),
  ]);
});
