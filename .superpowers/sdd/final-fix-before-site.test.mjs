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
    "Build. Play. Grow. Trust.",
    "Build the experience",
    "Play is just the beginning",
    "Games grow. So do you.",
    "Safe by design",
  ]) {
    assert.ok(html.includes(heading), `missing heading: ${heading}`);
  }
});

test("all hero versions use the approved Welcome message", async () => {
  const html = await read("index.html");
  const approvedLead = "Level Lab is an online platform where you can dream up your own games, remix your favorites, and share creations with your friends!";

  for (const { version, block } of getHeroPanelBlocks(html)) {
    assert.match(block, /<span class="section-eyebrow">Welcome<\/span>/, `hero panel ${version} must use the Welcome eyebrow`);
    assert.match(
      block,
      /<h1 class="hero-title" aria-label="Build\. Play\. Grow\. Trust\."><span>Build\.<\/span> Play\. Grow\. Trust\.<\/h1>/,
      `hero panel ${version} must use the approved heading and accent Build`,
    );
    assert.ok(block.includes(approvedLead), `hero panel ${version} must use the approved lead`);
  }
});

test("all hero versions show the approved prototype creator activity", async () => {
  const html = await read("index.html");
  const avatarPaths = Array.from(
    { length: 5 },
    (_, index) => `assets/images/creator-avatar-${index + 1}.svg`,
  );

  for (const { version, block } of getHeroPanelBlocks(html)) {
    const proofMatch = block.match(/<div class="hero-proof">[\s\S]*?<\/div>\s*<\/div>/);
    assert.ok(proofMatch, `hero panel ${version} must include creator activity`);
    const proof = proofMatch[0];
    assert.equal(countMatches(proof, /class="hero-proof-avatar"/g), 5);
    assert.match(proof, /<strong>879<\/strong> creators active this week/);
    assert.match(proof, /class="hero-proof-status" aria-hidden="true"/);
    for (const avatarPath of avatarPaths) {
      assert.ok(proof.includes(`src="${avatarPath}"`), `hero panel ${version} is missing ${avatarPath}`);
    }
  }

  for (const avatarPath of avatarPaths) {
    const asset = await read(avatarPath);
    assert.match(asset, /<svg\b/);
  }
});

test("hero creator activity uses the approved layout and responsive behavior", async () => {
  const css = await read("styles.css");
  assert.match(css, /\.hero-proof\s*\{[^}]*display:\s*flex[^}]*margin-top:\s*var\(--space-3\)[^}]*font-size:\s*14px/s);
  assert.match(css, /\.hero-proof-avatar\s*\{[^}]*width:\s*28px[^}]*height:\s*28px[^}]*border-radius:\s*50%/s);
  assert.match(css, /\.hero-proof-avatar \+ \.hero-proof-avatar\s*\{[^}]*margin-left:\s*-8px/s);
  assert.match(css, /\.hero-proof-status\s*\{[^}]*background:\s*var\(--color-success\)/s);
  assert.match(css, /\.hero-variant-b \.hero-proof\s*\{[^}]*color:\s*var\(--color-core-light\)/s);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.hero-proof\s*\{[^}]*flex-wrap:\s*wrap/s);
});

test("Versions A and C opt into the unframed full-video presentation", async () => {
  const html = await read("index.html");
  const panels = new Map(getHeroPanelBlocks(html).map(({ version, block, openingTag }) => [version, { block, openingTag }]));

  for (const version of ["a", "c"]) {
    assert.match(panels.get(version).openingTag, /\bhero-variant-unframed\b/, `hero panel ${version} must be unframed`);
    assert.match(panels.get(version).block, /\bhero-media-full\b/, `hero panel ${version} must show full media`);
  }
  assert.doesNotMatch(panels.get("b").openingTag, /\bhero-variant-unframed\b/, "hero panel b must retain its background-video composition");
});

test("the capability rail follows the hero with four approved benefits", async () => {
  const html = await read("index.html");
  const railMatch = html.match(
    /<section class="capability-rail reveal" aria-label="Why Level Lab">[\s\S]*?<\/section>/,
  );
  assert.ok(railMatch, "missing the Why Level Lab capability rail");

  const rail = railMatch[0];
  const approvedBenefits = [
    ["AI-assisted creation", "Describe what you want, and watch it appear."],
    ["No coding required", "Every tool works by pointing, dragging, and talking."],
    ["You stay in control", "Accept, tweak, or undo anything the AI suggests."],
    ["Publish and play", "Share your game with one click, right in the browser."],
  ];

  assert.equal(countMatches(rail, /<li class="capability-item">/g), 4);
  assert.equal(countMatches(rail, /<span class="capability-icon" aria-hidden="true">/g), 4);
  for (const [title, description] of approvedBenefits) {
    assert.ok(rail.includes(title), `missing capability title: ${title}`);
    assert.ok(rail.includes(description), `missing capability description: ${description}`);
  }

  const welcomeIndex = html.indexOf('id="welcome"');
  const railIndex = html.indexOf('class="capability-rail reveal"');
  const buildIndex = html.indexOf('id="build"');
  assert.ok(welcomeIndex < railIndex && railIndex < buildIndex, "capability rail must sit between Welcome and Build");
});

test("the capability rail uses the approved responsive grid", async () => {
  const css = await read("styles.css");
  assert.match(css, /\.capability-list\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.capability-icon\s*\{[^}]*width:\s*40px[^}]*height:\s*40px/s);
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.capability-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?\.capability-list\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
});

test("the capability rail is full width with a centered fixed-dark inner grid", async () => {
  const css = await read("styles.css");

  assert.match(
    css,
    /\.capability-rail\s*\{[^}]*max-width:\s*none[^}]*margin-right:\s*calc\(-1 \* \(var\(--content-gap\) \+ var\(--safe-area-right\)\)\)[^}]*margin-left:\s*calc\(-1 \* \(var\(--content-gap\) \+ var\(--safe-area-left\)\)\)[^}]*background:\s*var\(--color-core-darkest\)/s,
  );
  assert.match(
    css,
    /\.capability-list\s*\{[^}]*width:\s*min\(calc\(100% - var\(--content-gap\) - var\(--content-gap\) - var\(--safe-area-left\) - var\(--safe-area-right\)\),\s*var\(--width-content\)\)[^}]*margin:\s*0 auto/s,
  );
  assert.match(css, /\.capability-item\s*\{[^}]*padding:\s*var\(--space-5\) clamp\(var\(--space-3\),\s*2vw,\s*var\(--space-4\)\)/s);
  assert.match(css, /\.capability-icon\s*\{[^}]*border:[^;]*var\(--color-core-dark\)[^}]*background:\s*var\(--color-core-darker\)[^}]*color:\s*var\(--color-accent-light\)/s);
  assert.match(css, /\.capability-title\s*\{[^}]*color:\s*var\(--color-core-lightest\)/s);
  assert.match(css, /\.capability-description\s*\{[^}]*color:\s*var\(--color-core-light\)/s);
});

test("the capability rail has breathing room below the hero without doubling mobile spacing", async () => {
  const css = await read("styles.css");
  assert.match(css, /\.capability-rail\s*\{[^}]*margin-top:\s*var\(--space-4\)/s);
  assert.match(
    css,
    /@media\s*\(max-height:\s*768px\),\s*\(max-width:\s*768px\)[\s\S]*?\.capability-rail\s*\{[^}]*margin-top:\s*0/s,
  );
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
  assert.match(css, /--width-page-min:\s*320px/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.nav-version\s*\{[^}]*min-height:\s*44px/s);
  assert.match(css, /\.hero-actions \.button\s*\{[^}]*height:\s*44px/s);
  assert.match(css, /\.hero-shell\s*\{[^}]*min-height:\s*clamp\([^;]*,\s*600px\)/s);
  assert.match(css, /\.hero-shell\s*\{[^}]*background:\s*transparent/s);
  assert.match(css, /\.hero-variant-unframed\s*\{[^}]*position:\s*relative/s);
  assert.match(css, /\.hero-media-full \.hero-video\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9[^}]*object-fit:\s*contain/s);
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
  assert.ok(
    responsiveBlocks.some((block) => /\.nav-version\s*\{[^}]*min-width:\s*44px/s.test(block)),
    ".nav-version must keep a 44px mobile touch width",
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*480px\)[\s\S]*?\.nav-theme\s*\{[^}]*display:\s*none/s,
    "the theme control must yield space to the required phone navigation",
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*480px\)[\s\S]*?\.hero-variant-a \.hero-window\s*\{[^}]*width:\s*calc\(100%\s*-\s*30px\)/s,
    "Version A's full video must use the available width on the smallest phones",
  );
});

test("the header wordmark is bold and its icon follows the wordmark color", async () => {
  const css = await read("styles.css");
  assert.match(css, /\.app-name\s*\{[^}]*font-weight:\s*var\(--font-weight-bold\)/s);
  assert.match(css, /\.app-name::before\s*\{[^}]*background(?:-color)?:\s*currentColor[^}]*mask:/s);
  assert.match(css, /\.app-name img\s*\{[^}]*display:\s*none/s);
});

test("primary navigation links reveal a smooth mini underline", async () => {
  const css = await read("styles.css");
  assert.match(css, /\.nav-global \.nav-link\s*\{[^}]*position:\s*relative/s);
  assert.match(
    css,
    /\.nav-global \.nav-link::after\s*\{[^}]*width:\s*var\(--space-3\)[^}]*transform:\s*translateX\(-50%\)\s+scaleX\(0\)[^}]*transition:[^}]*transform\s+0\.2s\s+ease-out/s,
  );
  assert.match(css, /\.nav-global \.nav-link:focus-visible::after\s*\{[^}]*scaleX\(1\)/s);
  assert.match(css, /@media\s*\(hover:\s*hover\)[\s\S]*?\.nav-global \.nav-link:hover::after\s*\{[^}]*scaleX\(1\)/s);
});

test("numbered feature steps are slightly indented from the lead copy", async () => {
  const css = await read("styles.css");
  assert.match(css, /\.steps\s*\{[^}]*padding-left:\s*var\(--space-2\)/s);
});

test("Version B keeps its video-scrim foreground fixed across themes", async () => {
  const css = await read("styles.css");
  const fixedForeground = [
    [".hero-variant-b .hero-title", "var(--color-core-lightest)"],
    [".hero-variant-b .hero-title span", "var(--color-accent-light)"],
    [".hero-variant-b .section-eyebrow", "var(--color-accent-light)"],
    [".hero-variant-b .hero-lead", "var(--color-core-lighter)"],
  ];

  for (const [selector, color] of fixedForeground) {
    assert.match(
      css,
      new RegExp(`${selector.replaceAll(".", "\\.")}\\s*\\{[^}]*color:\\s*${color.replaceAll("(", "\\(").replaceAll(")", "\\)")}`, "s"),
      `${selector} must use a fixed readable token over Version B's dark scrim`,
    );
  }
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
  const heroJs = await read("hero-variants.mjs");
  assert.match(js, /data-scroll-target/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /data-media-fallback/);
  assert.match(js, /data-theme-toggle/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /is-loaded/);
  assert.match(heroJs, /URLSearchParams/);
  assert.match(heroJs, /data-hero-panel/);
  assert.match(heroJs, /data-hero-video/);
  assert.match(heroJs, /IntersectionObserver/);
  assert.match(heroJs, /prefers-reduced-motion/);
});

test("required visual assets are local", async () => {
  const html = await read("index.html");
  const levelLabMark = await read("assets/icons/level-lab-mark.svg");
  assert.doesNotMatch(html, /(?:src|poster)="https?:\/\//);
  assert.match(html, /src="assets\/icons\/level-lab-mark\.svg\?v=\d+"/);
  assert.match(levelLabMark, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(levelLabMark, /fill="#e5e5e5"/);
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
