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
  const versions = ["a", "b", "c", "d", "e"];
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
  assert.match(html, /<link[^>]+href="styles\.css(?:\?v=[^"]+)?"/);
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

test("Version A uses the notched video hero with a theme-colored action cutout", async () => {
  const css = await read("styles.css");

  assert.match(css, /body:has\(\.hero-variant-a:not\(\[hidden\]\)\)::before\s*\{[^}]*background:\s*var\(--color-background\)/s);
  assert.match(css, /\.hero-shell::before\s*\{[^}]*top:\s*calc\(-1 \* var\(--content-gap\)\)[^}]*bottom:\s*0[^}]*background:\s*transparent/s);
  assert.match(css, /body:has\(\.hero-variant-a:not\(\[hidden\]\)\) \.hero-shell::before\s*\{[^}]*background:\s*linear-gradient\(180deg, #101010 0%, #1a1a1a 100%\)/s);
  assert.match(css, /\.hero-variant-a\.hero-variant-unframed\s*\{[^}]*height:\s*clamp\([^}]*overflow:\s*hidden[^}]*border:\s*0[^}]*background:\s*var\(--color-background\)/s);
  assert.match(css, /\.hero-variant-a::after\s*\{[^}]*right:\s*0[^}]*bottom:\s*0[^}]*width:\s*min\(380px, calc\(100% - 20px\)\)[^}]*height:\s*72px[^}]*border-radius:\s*var\(--hero-cutout-radius\) 0 0 0[^}]*background:\s*var\(--color-background\)/s);
  assert.doesNotMatch(css, /\.hero-variant-a::before\s*\{/);
  assert.match(css, /\.hero-variant-a \.hero-window\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*width:\s*100%[^}]*height:\s*auto[^}]*overflow:\s*hidden[^}]*border-radius:\s*var\(--radius-lg\)/s);
  assert.match(css, /--hero-cutout-width:\s*min\(380px, calc\(100% - 20px\)\)/s);
  assert.doesNotMatch(css, /clip-path:\s*(?:polygon|shape)\(/s, "Version A should use the rounded overlay cutout");
  assert.match(css, /\.hero-variant-a \.hero-window \.hero-video\s*\{[^}]*height:\s*100%[^}]*object-fit:\s*cover/s);
  assert.match(css, /\.hero-variant-a \.hero-window::after\s*\{[^}]*background:\s*rgba\(0, 32, 74, 0\.25\)/s);
  assert.doesNotMatch(css, /\.hero-variant-a[^}]*-webkit-text-stroke/s, "Version A text should not use hard strokes");
  assert.match(css, /\.hero-variant-a \.hero-title,[\s\S]*?text-shadow:\s*0 4px 14px rgba\(0, 0, 0, 0\.72\)/s);
  assert.match(css, /\.hero-variant-b\s*\{[^}]*background:\s*transparent/s);
  assert.match(css, /\.hero-variant-a \.hero-actions\s*\{[^}]*position:\s*absolute[^}]*right:\s*calc\([^}]*var\(--hero-cutout-width\)[^}]*var\(--hero-actions-width\)[^}]*\)[^}]*bottom:\s*14px/s);
  assert.match(css, /\.hero-variant-a \.hero-primary\s*\{[^}]*order:\s*1[^}]*flex:\s*1\.25 1 0/s);
  assert.match(css, /\.hero-variant-a \.hero-secondary\s*\{[^}]*order:\s*2[^}]*flex:\s*0\.85 1 0[^}]*background:\s*transparent/s);
  assert.match(css, /\.hero-variant-a \.hero-proof\s*\{[^}]*position:\s*absolute[^}]*left:\s*var\(--space-4\)[^}]*bottom:\s*var\(--space-3\)/s);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.hero-variant-a \.hero-proof\s*\{[^}]*bottom:\s*92px/s);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.hero-variant-a \.hero-actions \.button\s*\{[^}]*flex:\s*1/s);
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
  assert.match(css, /\.capability-list\s*\{[^}]*gap:\s*var\(--space-2\)/s);
  assert.match(css, /\.capability-icon\s*\{[^}]*width:\s*40px[^}]*height:\s*40px/s);
  assert.match(css, /\.capability-item\s*\{[^}]*border:\s*1px\s+solid\s+color-mix\([^}]*\)[^}]*border-radius:\s*var\(--radius-lg\)[^}]*background:\s*color-mix\([^}]*\)[^}]*backdrop-filter:\s*blur\(6px\)/s);
  assert.match(css, /\.capability-item\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--color-surface\) 42%, var\(--color-background\)\)/s);
  const sharedCss = css.replace(
    /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) \.capability-item \+ \.capability-item\s*\{[^}]*\}/s,
    "",
  );
  assert.doesNotMatch(sharedCss, /\.capability-item\s*\+\s*\.capability-item\s*\{/s, "shared capability cards should use spacing instead of separator rules");
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.capability-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?\.capability-list\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
});

test("the capability rail is full width with a centered fixed-dark inner grid", async () => {
  const css = await read("styles.css");

  assert.match(
    css,
    /\.capability-rail\s*\{[^}]*max-width:\s*none[^}]*margin-right:\s*calc\(-1 \* \(var\(--content-gap\) \+ var\(--safe-area-right\)\)\)[^}]*margin-left:\s*calc\(-1 \* \(var\(--content-gap\) \+ var\(--safe-area-left\)\)\)[^}]*background:\s*transparent/s,
  );
  assert.match(
    css,
    /\.capability-list\s*\{[^}]*width:\s*min\(calc\(100% - var\(--content-gap\) - var\(--content-gap\) - var\(--safe-area-left\) - var\(--safe-area-right\)\),\s*var\(--width-content\)\)[^}]*margin:\s*0 auto/s,
  );
  assert.match(css, /\.capability-item\s*\{[^}]*padding:\s*var\(--space-5\) clamp\(var\(--space-3\),\s*2vw,\s*var\(--space-4\)\)[^}]*border-radius:\s*var\(--radius-lg\)/s);
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

test("the how-it-works section follows the capability rail with three clear steps", async () => {
  const html = await read("index.html");
  const sectionMatch = html.match(
    /<section class="how-it-works reveal" aria-labelledby="how-it-works-title">[\s\S]*?<\/section>/,
  );
  assert.ok(sectionMatch, "missing the how-it-works section");

  const section = sectionMatch[0];
  assert.equal(countMatches(section, /<li class="how-step">/g), 3);
  assert.ok(section.includes("How Level Lab works"));
  assert.ok(section.includes("From idea to playable in 3 simple steps"));
  assert.ok(section.includes("Describe your idea"));
  assert.ok(section.includes("Build and customize"));
  assert.ok(section.includes("Publish, play, and remix"));

  const railIndex = html.indexOf('class="capability-rail reveal"');
  const stepsIndex = html.indexOf('class="how-it-works reveal"');
  const buildIndex = html.indexOf('id="build"');
  assert.ok(railIndex < stepsIndex && stepsIndex < buildIndex, "how-it-works must sit between the rail and Build");
});

test("the how-it-works section follows the desktop wireframe with a responsive fallback", async () => {
  const html = await read("index.html");
  const css = await read("styles.css");
  assert.match(html, /class="how-step-number">STEP 1<\/span>/);
  assert.match(html, /class="how-step-number">STEP 2<\/span>/);
  assert.match(html, /class="how-step-number">STEP 3<\/span>/);
  assert.match(css, /\.how-steps\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.how-it-works-intro\s*\{[^}]*max-width:\s*none/s);
  assert.match(css, /\.how-it-works-title\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(css, /\.how-step\s*\{[^}]*min-height:\s*250px[^}]*border:\s*0[^}]*border-radius:\s*var\(--radius-lg\)[^}]*background:\s*color-mix\([^}]*\)[^}]*text-align:\s*left/s);
  assert.match(css, /\.how-step\s*\{[^}]*transition:\s*background\s+180ms\s+ease/s);
  assert.match(css, /\.how-step:hover\s*\{[^}]*background:\s*color-mix\(/s);
  assert.doesNotMatch(css, /\.how-step:hover\s*\{[^}]*cursor:\s*pointer/s);
  assert.match(css, /\.how-step-topline\s*\{[^}]*justify-content:\s*space-between[^}]*min-height:\s*40px/s);
  assert.match(css, /\.how-step-number\s*\{[^}]*border-radius:\s*999px[^}]*background:\s*#4a74ee/s);
  assert.match(css, /\.how-step-number\s*\{[^}]*display:\s*inline-flex[^}]*flex:\s*0 0 auto[^}]*width:\s*max-content[^}]*min-width:\s*max-content[^}]*white-space:\s*nowrap/s);
  assert.match(css, /\.how-step-number::before\s*\{[^}]*content:\s*none/s);
  assert.match(css, /\.how-step-icon\s*\{[^}]*width:\s*40px[^}]*height:\s*40px[^}]*border:\s*0[^}]*background:\s*transparent/s);
  assert.match(css, /\.how-step-icon svg\s*\{[^}]*width:\s*30px[^}]*height:\s*30px/s);
  assert.match(css, /\.how-step:not\(:last-child\)::before\s*\{[^}]*display:\s*none/s);
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.how-it-works-title\s*\{[^}]*white-space:\s*normal/s);
  assert.match(css, /\.build-feature\s*\{[^}]*margin-top:\s*calc\(var\(--content-gap\) \+ var\(--space-5\)\)[^}]*padding:\s*clamp\(50px, 6vw, 80px\)/s);
  assert.match(css, /@media\s*\(max-height:\s*768px\),\s*\(max-width:\s*768px\)[\s\S]*?\.how-steps\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
});

test("the Build section uses the approved text-left video-right composition", async () => {
  const html = await read("index.html");
  const buildMatch = html.match(/<section class="feature build-feature reveal" id="build"[\s\S]*?<\/section>/);
  assert.ok(buildMatch, "missing the Build feature section");

  const build = buildMatch[0];
  assert.match(build, /class="feature-text"[\s\S]*class="feature-media builder-showcase"/);
  assert.match(build, /class="builder-asset-panel"[^>]+src="assets\/images\/builder\/asset-tree\.png"/);
  assert.match(build, /class="builder-video-frame"[\s\S]*class="feature-video builder-video"/);
  assert.doesNotMatch(build, /class="builder-assistant-panel"/);
  assert.match(build, /src="assets\/media\/build2\.mp4"/);
  assert.ok(build.includes("Build</span> — AI that keeps you in control"));
  assert.ok(build.includes("Trust</span> — Safety built in, not patched on"));
  assert.ok(build.includes(">Start Creating<"));

  const css = await read("styles.css");
  assert.match(css, /\.build-feature\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*0\.9fr\)\s+minmax\(0,\s*1\.1fr\)[^}]*align-items:\s*center/s);
  assert.match(css, /\.build-feature \.feature-media\s*\{[^}]*min-height:\s*clamp\([^}]*overflow:\s*visible[^}]*border:\s*0[^}]*background:\s*transparent/s);
  assert.match(css, /\.builder-video-frame\s*\{[^}]*left:\s*6%[^}]*z-index:\s*2[^}]*width:\s*94%[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /\.builder-asset-panel\s*\{[^}]*top:\s*-2%[^}]*left:\s*0[^}]*z-index:\s*1[^}]*width:\s*31\.2%[^}]*max-width:\s*216px/s);
  assert.doesNotMatch(css, /\.builder-assistant-panel\s*\{/);
  assert.match(css, /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) \.build-feature\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.1fr\)\s+minmax\(0,\s*0\.9fr\)/s);
  assert.match(css, /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) \.build-feature \.feature-media\s*\{[^}]*grid-column:\s*1[^}]*grid-row:\s*1/s);
  assert.match(css, /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) \.build-feature \.feature-text\s*\{[^}]*grid-column:\s*2[^}]*grid-row:\s*1[^}]*transform:\s*translateX\(56px\)/s);
});

test("the Play section uses the approved featured game gallery", async () => {
  const html = await read("index.html");
  const playMatch = html.match(/<section class="feature play-gallery reveal" id="play"[\s\S]*?<\/section>/);
  assert.ok(playMatch, "missing the Play gallery section");

  const play = playMatch[0];
  assert.equal(countMatches(play, /<article class="play-card/g), 6);
  assert.match(play, /class="play-card play-card-featured"/);
  assert.match(play, /data-hover-video/);
  assert.match(play, /class="play-card-video play-card-thumbnail" src="assets\/images\/highway-racer-thumbnail\.png" alt="Highway Racer game thumbnail"/);
  assert.match(play, /class="play-card-video play-card-live" src="assets\/media\/highway-racer-hover\.mp4" muted loop playsinline preload="none"/);
  assert.match(play, /class="play-card-video play-card-thumbnail" src="assets\/images\/escape-apocalypse-thumbnail\.png" alt="Escape the Apocalypse game thumbnail"/);
  assert.match(play, /class="play-card-video play-card-live" src="assets\/media\/escape-apocalypse-hover\.mp4" muted loop playsinline preload="none"/);
  assert.match(play, /class="play-card-video play-card-thumbnail" src="assets\/images\/scuba-diver-thumbnail\.png" alt="Scuba Diver game thumbnail"/);
  assert.match(play, /class="play-card-video play-card-live" src="assets\/media\/scuba-diver-hover\.mp4" muted loop playsinline preload="none"/);
  assert.match(play, /class="play-card-video play-card-thumbnail" src="assets\/images\/box-dash-thumbnail\.png" alt="Box Dash game thumbnail"/);
  assert.match(play, /class="play-card-video play-card-live" src="assets\/media\/box-dash-hover\.mp4" muted loop playsinline preload="none"/);
  assert.match(play, /class="play-card-video play-card-thumbnail" src="assets\/images\/bloody-tower-thumbnail\.png" alt="Bloody Tower game thumbnail"/);
  assert.match(play, /class="play-card-video play-card-live" src="assets\/media\/bloody-tower-hover\.mp4" muted loop playsinline preload="none"/);
  assert.match(play, /class="play-card-video play-card-thumbnail" src="assets\/images\/jaws-thumbnail\.png" alt="Jaws game thumbnail"/);
  assert.match(play, /class="play-card-video play-card-live" src="assets\/media\/jaws-hover\.mp4" muted loop playsinline preload="none"/);
  assert.equal(countMatches(play, /class="play-card-actions"/g), 6);
  assert.equal(countMatches(play, /class="play-card-action-button(?: [^"]*)?"/g), 24);
  assert.equal(countMatches(play, /class="play-card-action-button play-card-action-remix"/g), 6);
  assert.equal(countMatches(play, /class="play-card-remix-icon" src="assets\/images\/remix-icon-transparent\.svg" alt=""/g), 6);
  assert.equal(countMatches(play, /aria-label="(?:Highway Racer|Escape the Apocalypse|Scuba Diver|Bloody Tower|Box Dash|Jaws) actions"/g), 6);
  assert.match(play, /<p class="play-gallery-summary"><strong>See<\/strong> worlds made by creators like you, <strong>play<\/strong> instantly in your browser on any device, and <strong>remix<\/strong> any game to make it the starting point of your own\.<\/p>/);
  assert.doesNotMatch(play, /play-gallery-step-num/);
  assert.equal(countMatches(play, /class="button button-accent play-card-action"/g), 0);
  assert.ok(play.includes("Explore More Games"));

  const css = await read("styles.css");
  assert.match(css, /\.play-gallery-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)[^}]*width:\s*100%/s);
  assert.match(css, /\.play-card-featured\s*\{[^}]*grid-row:\s*auto/s);
  assert.match(css, /\.play-card\s*\{[^}]*padding:\s*8px[^}]*border:\s*2px[^}]*border-radius:\s*18px[^}]*background:\s*color-mix\([^}]*\)/s);
  assert.match(css, /\.play-card-media\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9[^}]*overflow:\s*visible[^}]*border-radius:\s*8px/s);
  assert.match(css, /\.play-card-video\s*\{[^}]*border-radius:\s*8px[^}]*object-fit:\s*cover/s);
  assert.match(css, /\.play-card-live\s*\{[^}]*opacity:\s*0[^}]*pointer-events:\s*none/s);
  assert.match(css, /\.play-card-media\.is-video-active \.play-card-live\s*\{[^}]*opacity:\s*1/s);
  assert.match(css, /\.play-card-actions\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)[^}]*padding:\s*42px\s+8px\s+11px[^}]*background:\s*linear-gradient\([^}]*transparent[^}]*var\(--color-core-darkest\)\s+100%\)[^}]*opacity:\s*0[^}]*visibility:\s*hidden/s);
  assert.match(css, /\.play-card-actions\s*\{[^}]*bottom:\s*-8px[^}]*border-radius:\s*0\s+0\s+8px\s+8px/s);
  assert.match(css, /\.play-card:hover \.play-card-actions,\s*\.play-card:focus-within \.play-card-actions\s*\{[^}]*opacity:\s*1[^}]*visibility:\s*visible[^}]*pointer-events:\s*auto/s);
  assert.match(css, /\.play-card-action-button\s*\{[^}]*min-height:\s*44px[^}]*background:\s*transparent[^}]*cursor:\s*pointer/s);
  assert.match(css, /\.play-card-action-button:hover,\s*\.play-card-action-button:focus-visible\s*\{[^}]*background:\s*transparent[^}]*color:\s*var\(--color-accent-light\)/s);
  assert.match(css, /\.play-card-remix-icon\s*\{[^}]*width:\s*20px[^}]*height:\s*20px[^}]*opacity:\s*0\.82/s);
  const remixIcon = await read("assets/images/remix-icon-transparent.svg");
  assert.match(remixIcon, /feColorMatrix[^>]*0\.933333/);
  assert.match(remixIcon, /feColorMatrix[^>]*-0\.333333/);
  assert.match(css, /\.play-gallery-action\s*\{[^}]*min-width:\s*190px[^}]*height:\s*44px[^}]*border-width:\s*2px[^}]*border-color:\s*var\(--color-border-light\)[^}]*font-weight:\s*var\(--font-weight-bold\)/s);
  assert.match(css, /body:has\(\.hero-variant-a:not\(\[hidden\]\)\) #play\s*\{[^}]*width:\s*calc\(100% \+ \(2 \* var\(--content-gap\)\) \+ var\(--safe-area-left\) \+ var\(--safe-area-right\)\)[^}]*max-width:\s*none[^}]*margin-right:\s*calc\(-1 \* \(var\(--content-gap\) \+ var\(--safe-area-right\)\)\)[^}]*margin-left:\s*calc\(-1 \* \(var\(--content-gap\) \+ var\(--safe-area-left\)\)\)[^}]*border:\s*0[^}]*border-radius:\s*0[^}]*background:[^}]*play-bg\.png/s);
  assert.match(css, /body:has\(\.hero-variant-a:not\(\[hidden\]\)\) #play\s*\{[^}]*padding:\s*clamp\(32px,\s*4vw,\s*52px\)\s+clamp\(20px,\s*4vw,\s*56px\)/s);
  assert.match(css, /body:has\(\.hero-variant-a:not\(\[hidden\]\)\) #play \.play-gallery-head,[\s\S]*?body:has\(\.hero-variant-a:not\(\[hidden\]\)\) #play \.play-gallery-cta\s*\{[^}]*width:\s*100%[^}]*max-width:\s*var\(--width-content\)[^}]*margin-right:\s*auto[^}]*margin-left:\s*auto/s);
  assert.match(css, /body:has\(\.hero-variant-a:not\(\[hidden\]\)\) #play \.play-gallery-summary\s*\{[^}]*max-width:\s*760px[^}]*font-size:\s*16px[^}]*line-height:\s*1\.55/s);
  assert.match(css, /body:has\(\.hero-variant-b:not\(\[hidden\]\)\) #play \.play-gallery-summary,\s*body:has\(\.hero-variant-c:not\(\[hidden\]\)\) #play \.play-gallery-summary\s*\{[^}]*font-size:\s*16px[^}]*line-height:\s*1\.55/s);
  assert.match(css, /:root\[data-theme='light'\] body:has\(\.hero-variant-a:not\(\[hidden\]\)\) #play\s*\{[^}]*background-image:\s*url\("assets\/images\/play-bg-light\.png"\)/s);
  assert.match(css, /body:has\(\.hero-variant-a:not\(\[hidden\]\)\) #play \.section-eyebrow\s*\{[^}]*color:\s*var\(--color-core-darkest\)[^}]*font-weight:\s*var\(--font-weight-bold\)/s);
  assert.doesNotMatch(css, /body:has\(\.hero-variant-a:not\(\[hidden\]\)\) #play \.play-card\s*\{[^}]*background:\s*rgba\(74, 116, 238, 0\.9/s);
  const script = await read("script.js");
  assert.match(script, /querySelectorAll\("\[data-hover-video\]"\)/);
  assert.match(script, /video\.play\(\)/);
  await read("assets/images/play-bg.png");
  await read("assets/images/play-bg-light.png");
});

test("the Grow section uses centered flip cards over the tree artwork", async () => {
  const html = await read("index.html");
  const grow = html.match(/<section class="feature grow-section reveal" id="learn"[\s\S]*?<\/section>/);
  assert.ok(grow, "missing the Grow section");
  assert.equal(countMatches(grow[0], /class="flip-card"/g), 3);
  assert.equal(countMatches(grow[0], /class="flip-cue"/g), 3);
  assert.ok(grow[0].includes("Your Games Grow"));
  assert.ok(grow[0].includes("Your Skills Grow"));
  assert.ok(grow[0].includes("Your Audience Grows"));

  const css = await read("styles.css");
  assert.match(css, /\.grow-section\s*\{[^}]*display:\s*block[^}]*background:\s*var\(--color-background\)/s);
  assert.match(css, /\.grow-section::before\s*\{[^}]*background:\s*url\("assets\/images\/grow\.png"\)[^}]*opacity:\s*0\.08/s);
  assert.match(css, /\.grow-section \.grow-cards\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.grow-section \.flip-card\s*\{[^}]*height:\s*170px/s);
});

test("Version D Grow cards orbit an interactive branch symbol", async () => {
  const html = await read("index.html");
  const css = await read("styles.css");
  const grow = html.match(/<section class="feature grow-section reveal" id="learn"[\s\S]*?<\/section>/);
  const dSelector = String.raw`body:has\(\.hero-variant-d:not\(\[hidden\]\)\)`;

  assert.ok(grow, "missing the Grow section");
  assert.match(grow[0], /class="grow-orbit"/);
  assert.match(grow[0], /class="grow-hub"[^>]*tabindex="0"[^>]*aria-describedby="grow-hub-description"/);
  assert.equal(countMatches(grow[0], /data-grow-card="(?:left|top|right)"/g), 3);
  assert.equal(countMatches(grow[0], /data-grow-node="(?:left|top|right|lower-left|lower-right)"/g), 5);
  assert.match(grow[0], /id="grow-hub-description"/);

  assert.match(css, new RegExp(`${dSelector} \.grow-orbit\\s*\\{[^}]*display:\\s*grid[^}]*grid-template-areas:`, "s"));
  assert.match(css, new RegExp(`${dSelector} #learn:has\\(\\[data-grow-card="left"\\]\\.is-flipped\\) \\[data-grow-node="left"\\]`, "s"));
  assert.match(css, new RegExp(`${dSelector} #learn:has\\(\\[data-grow-card="top"\\]\\.is-flipped\\) \\[data-grow-node="top"\\]`, "s"));
  assert.match(css, new RegExp(`${dSelector} #learn:has\\(\\[data-grow-card="right"\\]\\.is-flipped\\) \\[data-grow-node="right"\\]`, "s"));
  assert.match(css, new RegExp(`${dSelector} \.grow-hub:hover \.grow-hub-description`, "s"));
  assert.match(css, new RegExp(`${dSelector} \.grow-hub:focus-visible \.grow-hub-description`, "s"));
});

test("Version D Grow uses the larger balanced desktop composition", async () => {
  const html = await read("index.html");
  const css = await read("styles.css");
  const dSelector = String.raw`body:has\(\.hero-variant-d:not\(\[hidden\]\)\)`;

  assert.match(css, new RegExp(`${dSelector} #learn\\s*\\{[^}]*min-height:\\s*690px[^}]*border:\\s*0`, "s"));
  assert.match(css, new RegExp(`${dSelector} \.grow-orbit\\s*\\{[^}]*grid-template-rows:\\s*178px 210px[^}]*width:\\s*min\\(100%,\\s*1140px\\)`, "s"));
  assert.match(css, new RegExp(`${dSelector} \.grow-section \.flip-card\\s*\\{[^}]*width:\\s*340px[^}]*height:\\s*178px`, "s"));
  assert.match(html, /class="grow-hub-symbol" viewBox="0 0 150 190"/);
  assert.match(css, new RegExp(`${dSelector} \.grow-hub-symbol\\s*\\{[^}]*width:\\s*165px[^}]*height:\\s*250px`, "s"));
});

test("the Trust section uses a left message and three learn-more items", async () => {
  const html = await read("index.html");
  const trust = html.match(/<section class="feature trust-section reveal" id="safety"[\s\S]*?<\/section>/);
  assert.ok(trust, "missing the Trust section");
  assert.equal(countMatches(trust[0], /class="trust-item"/g), 3);
  assert.equal(countMatches(trust[0], /class="trust-link"/g), 3);
  assert.ok(trust[0].includes("AI Moderation"));
  assert.ok(trust[0].includes("Private by Default"));
  assert.ok(trust[0].includes("Guardians in the Loop"));

  const css = await read("styles.css");
  assert.match(css, /\.trust-section\s*\{[^}]*grid-template-columns:\s*minmax\(220px,\s*0\.9fr\) repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.trust-section\s*\{[^}]*border:\s*0\s*;/s);
  assert.match(css, /\.trust-section \.safety-grid\s*\{[^}]*grid-column:\s*2 \/ -1[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /body:has\(\.hero-variant-b:not\(\[hidden\]\)\) #safety,\s*body:has\(\.hero-variant-c:not\(\[hidden\]\)\) #safety\s*\{[^}]*justify-items:\s*center/s);
  assert.match(css, /body:has\(\.hero-variant-b:not\(\[hidden\]\)\) #safety \.trust-item,\s*body:has\(\.hero-variant-c:not\(\[hidden\]\)\) #safety \.trust-item\s*\{[^}]*text-align:\s*center/s);
});

test("the shared closing CTA finishes every hero version", async () => {
  const html = await read("index.html");
  const ctaMatch = html.match(/<section class="closing-cta reveal"[\s\S]*?<\/section>/);
  assert.ok(ctaMatch, "missing the closing CTA");
  assert.match(ctaMatch[0], /aria-labelledby="closing-cta-title"/);
  assert.match(ctaMatch[0], /Your next game starts here!/);
  assert.match(ctaMatch[0], /href="build\.html">Start Creating<\/a>/);
  assert.match(ctaMatch[0], /href="play\.html">Explore Games<\/a>/);

  const css = await read("styles.css");
  assert.match(css, /\.closing-cta\s*\{[^}]*display:\s*flex[^}]*border-radius:\s*var\(--radius-lg\)[^}]*background:\s*color-mix\(/s);
  assert.match(css, /\.closing-cta-actions\s*\.button\s*\{[^}]*height:\s*44px[^}]*font-weight:\s*var\(--font-weight-bold\)/s);
  assert.match(css, /\.closing-cta-secondary\s*\{[^}]*background:\s*transparent/s);
});

test("homepage exposes five shareable hero versions and defaults to A", async () => {
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
    {
      label: "Version D",
      pattern: /<a\b(?=[^>]*\shref="index\.html\?hero=d")(?=[^>]*\saria-label="Version D")[^>]*>\s*<span class="version-word">Version <\/span>D\s*<\/a>/,
    },
    {
      label: "Version E",
      pattern: /<a\b(?=[^>]*\shref="index\.html\?hero=e")(?=[^>]*\saria-label="Version E")[^>]*>\s*<span class="version-word">Version <\/span>E\s*<\/a>/,
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
  assert.match(html, /<script type="module" src="hero-variants\.mjs\?v=20260723-versione-glass"><\/script>/);
});

test("Version E keeps Version D content while using its own glass hero media", async () => {
  const html = await read("index.html");
  const dStart = html.indexOf('<div class="hero-variant hero-variant-d hero-variant-unframed" data-hero-panel="d"');
  const eStart = html.indexOf('<div class="hero-variant hero-variant-d hero-variant-e hero-variant-unframed" data-hero-panel="e"');
  const eEnd = html.indexOf('<a class="grid-more"', eStart);

  assert.ok(dStart >= 0, "Version D hero panel must remain present");
  assert.ok(eStart > dStart && eEnd > eStart, "Version E hero panel must follow Version D");

  const dPanel = html.slice(dStart, eStart);
  const ePanel = html.slice(eStart, eEnd);
  for (const copy of ["Welcome", "Build.", "Play.", "Grow.", "Trust.", "Start Creating"]) {
    assert.match(dPanel, new RegExp(copy.replace(".", "\\.")));
    assert.match(ePanel, new RegExp(copy.replace(".", "\\.")));
  }
  assert.match(dPanel, /data-src="assets\/media\/welcome\.mp4"/);
  assert.match(ePanel, /class="hero-reveal hero-media hero-media-full hero-glass-screen"/);
  assert.match(ePanel, /class="hero-ambient-video" data-hero-ambient/);
  assert.match(ePanel, /data-src="assets\/media\/play-remix-share\.mp4"/);
  assert.doesNotMatch(ePanel, /class="hero-glass-layer"/);
  assert.doesNotMatch(ePanel, /Inside Level Lab/);
});

test("Version E clear video keeps its synchronized live reflection", async () => {
  const css = await read("styles.css");
  const script = await read("script.js");
  const eSelector = String.raw`body:has\(\.hero-variant-e:not\(\[hidden\]\)\)`;

  assert.match(css, new RegExp(`${eSelector} \.hero-glass-screen\\s*\\{[^}]*isolation:\\s*isolate[^}]*overflow:\\s*visible[^}]*box-shadow:`, "s"));
  assert.match(css, new RegExp(`${eSelector} \.hero-ambient-video\\s*\\{[^}]*opacity:\\s*0\\.5`, "s"));
  assert.match(css, new RegExp(`${eSelector} \.hero-ambient-video\\s*\\{[^}]*filter:\\s*blur\\(38px\\)[^}]*saturate\\(1\\.75\\)`, "s"));
  assert.doesNotMatch(css, new RegExp(`${eSelector} \.hero-glass-layer`));
  assert.match(script, /glassHeroAmbient\.playbackRate = glassHeroVideo\.playbackRate/);
  assert.match(script, /new MutationObserver\(syncAmbientSource\)/);
  assert.match(script, /glassHeroVideo\.addEventListener\("pause", \(\) => glassHeroAmbient\.pause\(\)\)/);
});

test("Version E uses a centered solid canvas with full-bleed hero artwork", async () => {
  const html = await read("index.html");
  const css = await read("styles.css");
  const eSelector = String.raw`body:has\(\.hero-variant-e:not\(\[hidden\]\)\)`;

  assert.match(html, /styles\.css\?v=20260723-e-hero-align/);
  assert.match(css, new RegExp(`${eSelector}\\s*\\{[^}]*--version-e-page-width:\\s*66rem[^}]*--color-background:\\s*#111017[^}]*--font-size:\\s*16px[^}]*font-size:\\s*var\\(--font-size\\)[^}]*background:\\s*#111017`, "s"));
  assert.match(css, new RegExp(`${eSelector}::before\\s*\\{[^}]*background:\\s*#111017[^}]*background-image:\\s*none`, "s"));
  assert.match(css, /\.hero-variant-e\.hero-variant-unframed\s*\{[^}]*background:\s*#111017 url\("assets\/images\/level-labs-hero-d-3\.png"\) center \/ cover no-repeat/s);
  assert.doesNotMatch(css, /linear-gradient\(0deg,\s*#1a1a1a 0%,\s*#252525 52%,\s*#0d498d 100%\)/);
  assert.match(css, /--version-e-page-padding-y:\s*clamp\(3rem,\s*9vw,\s*9rem\)/);
  assert.match(css, /--version-e-page-padding-x:\s*clamp\(1rem,\s*3vw,\s*3rem\)/);
  assert.match(css, /--version-e-section-margin:\s*clamp\(3rem,\s*6vw,\s*6rem\)/);
  assert.match(css, /--version-e-content-spacing:\s*clamp\(1\.5rem,\s*2\.5vw,\s*2\.5rem\)/);
  assert.match(css, new RegExp(`${eSelector} \\.landing\\s*\\{[^}]*padding-top:\\s*0`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.hero-shell\\s*\\{[^}]*margin-top:\\s*0`, "s"));
});

test("Version D layers Version C hero content over its artwork", async () => {
  const html = await read("index.html");
  const css = await read("styles.css");
  const dPanel = getHeroPanelBlocks(html).find(({ version }) => version === "d")?.block;
  assert.ok(dPanel, "Version D hero panel must be present");
  assert.match(dPanel, /data-hero-panel="d"/);
  assert.match(dPanel, /\shidden(?:\s|=|>)/);
  assert.match(dPanel, /class="hero-copy"/);
  assert.match(dPanel, /<span class="section-eyebrow">Welcome<\/span>/);
  assert.match(dPanel, /<h1 class="hero-title"[^>]*><span>Build\.<\/span> Play\. Grow\. Trust\.<\/h1>/);
  assert.match(dPanel, /class="hero-actions"/);
  assert.match(dPanel, /class="hero-proof"/);
  assert.match(dPanel, /class="hero-reveal hero-media hero-media-full"/);
  assert.doesNotMatch(dPanel, /Inside Level Lab/);
  assert.equal(countMatches(dPanel, /data-src="assets\/media\/welcome\.mp4"/g), 1);
  assert.match(html, /class="capability-rail reveal"/);
  assert.match(html, /id="build"/);
  assert.match(html, /id="play"/);
  assert.match(html, /id="learn"/);
  assert.match(html, /id="safety"/);
  assert.match(css, /body:has\(\.hero-variant-d:not\(\[hidden\]\)\)::before\s*\{[^}]*background:\s*var\(--color-background\)/s);
  assert.match(css, /\.hero-variant-d \.hero-copy\s*\{[^}]*padding-top:\s*clamp\(35px, 6vh, 65px\)/s);
  assert.match(css, /\.hero-variant-d \.hero-reveal\s*\{[^}]*max-width:\s*var\(--width-content\)[^}]*margin:\s*0 auto/s);
  assert.match(css, /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) #play\s*\{[^}]*background:\s*url\("assets\/images\/play-bg-d\.png"\)/s);
  assert.match(css, /:root\[data-theme='light'\] body:has\(\.hero-variant-d:not\(\[hidden\]\)\) #play\s*\{[^}]*background-image:\s*url\("assets\/images\/play-bg-d\.png"\)/s);
  await read("assets/images/play-bg-d.png");
});

test("Version D uses the supplied Level Labs hero artwork", async () => {
  const css = await read("styles.css");
  const dSelector = String.raw`body:has\(\.hero-variant-d:not\(\[hidden\]\)\)`;

  assert.match(
    css,
    new RegExp(`${dSelector}\\s*\\{[^}]*--color-background:\\s*#111017[^}]*background:\\s*#111017`, "s"),
  );
  assert.match(
    css,
    /\.hero-variant-d\.hero-variant-unframed\s*\{[^}]*background:[^;}]*url\("assets\/images\/level-labs-hero-d-3\.png"\)[^;}]*center\s*\/\s*cover\s+no-repeat/s,
  );
  assert.match(
    css,
    new RegExp(`${dSelector} \\.hero-shell\\s*\\{[^}]*width:\\s*calc\\(100% \\+[^}]*max-width:\\s*none[^}]*margin-top:\\s*calc\\(-1 \\* var\\(--content-gap\\)\\)`, "s"),
  );
  assert.match(
    css,
    /\.hero-variant-d\.hero-variant-unframed\s*\{[^}]*height:\s*calc\(100dvh - var\(--height-header\) - var\(--height-footer\)\)[^}]*overflow:\s*visible[^}]*border-radius:\s*0/s,
  );
  assert.doesNotMatch(css, /\.hero-variant-d\.hero-variant-unframed\s*\{[^}]*height:\s*auto/s);
});

test("Version D uses editorial how-it-works panels without changing shared markup", async () => {
  const html = await read("index.html");
  const css = await read("styles.css");
  const dSelector = String.raw`body:has\(\.hero-variant-d:not\(\[hidden\]\)\)`;

  assert.equal(countMatches(html, /class="how-step flip-card"/g), 3);
  assert.match(css, new RegExp(`${dSelector} \\.how-step \\.flip-face\\s*\\{[^}]*border-top:\\s*2px solid var\\(--color-accent\\)[^}]*border-radius:\\s*6px[^}]*background:\\s*color-mix\\(`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step \\.flip-face\\s*\\{[^}]*align-items:\\s*flex-start[^}]*text-align:\\s*left`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step \\.flip-card-inner\\s*\\{[^}]*transition:\\s*transform 240ms ease`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step-topline\\s*\\{[^}]*width:\\s*100%[^}]*flex-direction:\\s*row-reverse`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step-icon\\s*\\{[^}]*width:\\s*52px[^}]*height:\\s*52px[^}]*color:\\s*var\\(--color-accent-light\\)`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step-number\\s*\\{[^}]*border-radius:\\s*6px[^}]*background:\\s*color-mix\\(`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step \\.flip-face-back \\.how-step-number\\s*\\{[^}]*position:\\s*absolute[^}]*top:\\s*32px[^}]*right:\\s*32px`, "s"));
});

test("Version D how-it-works cards use an angled numbered progress rail", async () => {
  const css = await read("styles.css");
  const dSelector = String.raw`body:has\(\.hero-variant-d:not\(\[hidden\]\)\)`;

  assert.match(css, new RegExp(`${dSelector} \\.how-steps\\s*\\{[^}]*position:\\s*relative[^}]*counter-reset:\\s*version-d-step[^}]*padding-top:\\s*58px`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-steps::before\\s*\\{[^}]*content:\\s*""[^}]*position:\\s*absolute[^}]*top:\\s*19px[^}]*height:\\s*1px[^}]*background:\\s*var\\(--color-accent\\)`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step::before\\s*\\{[^}]*content:\\s*"0" counter\\(version-d-step\\)[^}]*top:\\s*-58px[^}]*width:\\s*72px[^}]*height:\\s*34px[^}]*clip-path:\\s*polygon`, "s"));
});

test("Version D steps use supplied artwork above their copy", async () => {
  const html = await read("index.html");
  const css = await read("styles.css");
  const dSelector = String.raw`body:has\(\.hero-variant-d:not\(\[hidden\]\)\)`;

  assert.match(
    html,
    /<li class="how-step flip-card" data-step-media[\s\S]*?<img class="how-step-media" src="assets\/images\/describe-your-idea\.png" alt="A creator building a game with Level Lab's AI assistant" width="1536" height="1080">[\s\S]*?<div class="how-step-body">[\s\S]*?<h3 class="how-step-title">Describe your idea<\/h3>/,
  );
  assert.match(
    html,
    /<li class="how-step flip-card" data-step-media[\s\S]*?<img class="how-step-media" src="assets\/images\/build-and-customize\.png" alt="The Level Lab editor while customizing a game world" width="1699" height="931"[^>]*>[\s\S]*?<div class="how-step-body">[\s\S]*?<h3 class="how-step-title">Build and customize<\/h3>/,
  );
  assert.match(
    html,
    /<li class="how-step flip-card" data-step-media[\s\S]*?<img class="how-step-media" src="assets\/images\/publish\.png" alt="Publishing a finished game from the Level Lab editor" width="1536" height="1024"[^>]*>[\s\S]*?<div class="how-step-body">[\s\S]*?<h3 class="how-step-title">Publish, play, and remix<\/h3>/,
  );
  assert.equal(countMatches(html, /<li class="how-step flip-card" data-step-media/g), 3);
  assert.match(css, /\.how-step-media\s*\{[^}]*display:\s*none/s);
  assert.match(css, new RegExp(`${dSelector} \\.how-step\\[data-step-media\\] \\.flip-face-front\\s*\\{[^}]*padding:\\s*0`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step-media\\s*\\{[^}]*display:\\s*block[^}]*width:\\s*100%[^}]*height:\\s*138px[^}]*object-fit:\\s*cover`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step\\[data-step-media\\] \\.flip-face-front\\s*\\{[^}]*border-top:\\s*0[^}]*border-bottom:\\s*1px solid var\\(--color-accent\\)`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.how-step\\[data-step-media\\] \\.how-step-topline\\s*\\{[^}]*display:\\s*none`, "s"));
  await readFile(resolve(root, "assets/images/describe-your-idea.png"));
  await readFile(resolve(root, "assets/images/build-and-customize.png"));
  await readFile(resolve(root, "assets/images/publish.png"));
});

test("Version D capability rail uses flat columns with inline title icons", async () => {
  const css = await read("styles.css");
  const dSelector = String.raw`body:has\(\.hero-variant-d:not\(\[hidden\]\)\)`;

  assert.match(css, new RegExp(`${dSelector} \\.capability-list\\s*\\{[^}]*gap:\\s*0`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.capability-item\\s*\\{[^}]*display:\\s*grid[^}]*grid-template-columns:\\s*minmax\\(0, max-content\\) 24px[^}]*border:\\s*0[^}]*border-radius:\\s*0[^}]*background:\\s*transparent`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.capability-item \\+ \\.capability-item\\s*\\{[^}]*border-left:\\s*1px solid color-mix\\(in srgb, var\\(--color-accent\\) 60%, transparent\\)`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.capability-copy\\s*\\{[^}]*display:\\s*contents`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.capability-icon\\s*\\{[^}]*display:\\s*grid[^}]*position:\\s*static[^}]*grid-column:\\s*2[^}]*grid-row:\\s*1[^}]*width:\\s*24px[^}]*height:\\s*24px`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.capability-title\\s*\\{[^}]*grid-column:\\s*1[^}]*grid-row:\\s*1[^}]*font-size:\\s*18px[^}]*line-height:\\s*1\\.25`, "s"));
  assert.match(css, new RegExp(`${dSelector} \\.capability-description\\s*\\{[^}]*grid-column:\\s*1 \\/ -1[^}]*grid-row:\\s*2[^}]*margin:\\s*var\\(--space-3\\) 0 0[^}]*font-size:\\s*14px[^}]*line-height:\\s*1\\.45`, "s"));
});

test("Version E capability rail uses compact rounded cards with inline title icons", async () => {
  const css = await read("styles.css");
  const eSelector = String.raw`body:has\(\.hero-variant-e:not\(\[hidden\]\)\)`;

  assert.match(css, new RegExp(`${eSelector} \\.capability-list\\s*\\{[^}]*gap:\\s*12px`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.capability-item\\s*\\{[^}]*min-height:\\s*156px[^}]*padding:\\s*28px[^}]*border:\\s*0[^}]*border-radius:\\s*28px[^}]*background:\\s*#1e1e21`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.capability-item \\+ \\.capability-item\\s*\\{[^}]*border-left:\\s*0`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.capability-title\\s*\\{[^}]*font-size:\\s*18px`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.capability-description\\s*\\{[^}]*font-size:\\s*14px[^}]*line-height:\\s*1\\.5`, "s"));
});

test("Version E how-it-works is a static unframed process rail", async () => {
  const css = await read("styles.css");
  const script = await read("script.js");
  const eSelector = String.raw`body:has\(\.hero-variant-e:not\(\[hidden\]\)\)`;

  assert.match(css, new RegExp(`${eSelector} \\.how-step\\s*\\{[^}]*min-height:\\s*0[^}]*border:\\s*0[^}]*border-radius:\\s*0[^}]*background:\\s*transparent[^}]*perspective:\\s*none`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.how-step-media\\s*\\{[^}]*display:\\s*none`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.how-step \\.flip-card-inner\\s*\\{[^}]*min-height:\\s*0[^}]*transform:\\s*none !important[^}]*transition:\\s*none`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.how-step \\.flip-face-front\\s*\\{[^}]*position:\\s*relative[^}]*padding:\\s*0[^}]*border:\\s*0[^}]*border-radius:\\s*0[^}]*background:\\s*transparent`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.how-step \\.flip-face-back\\s*\\{[^}]*display:\\s*none`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.how-step-topline\\s*\\{[^}]*display:\\s*none`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.how-step\\[data-step-media\\] \\.how-step-title\\s*\\{[^}]*font-size:\\s*clamp\\(22px, 2vw, 28px\\)[^}]*white-space:\\s*nowrap`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.how-step:hover \\.flip-face-front\\s*\\{[^}]*border-color:\\s*transparent[^}]*box-shadow:\\s*none[^}]*outline:\\s*0`, "s"));
  assert.match(css, new RegExp(`${eSelector} \\.how-step:focus-visible\\s*\\{[^}]*box-shadow:\\s*none[^}]*outline:\\s*0`, "s"));
  assert.match(script, /const staticHowSteps = selectedHeroVersion === "e";/);
  assert.match(script, /if \(staticHowSteps && card\.classList\.contains\("how-step"\)\)/);
});

test("Version E process rail uses compact narrow V-chevron number markers", async () => {
  const css = await read("styles.css");
  const eSelector = String.raw`body:has\(\.hero-variant-e:not\(\[hidden\]\)\)`;

  assert.match(
    css,
    new RegExp(`${eSelector} \\.how-steps\\s*\\{[^}]*counter-reset:\\s*version-e-step`, "s")
  );
  assert.match(
    css,
    new RegExp(`${eSelector} \\.how-steps::before\\s*\\{[^}]*z-index:\\s*0[^}]*background:\\s*var\\(--color-accent\\)`, "s")
  );
  assert.match(
    css,
    new RegExp(`${eSelector} \\.how-step\\s*\\{[^}]*counter-increment:\\s*version-e-step`, "s")
  );
  assert.match(
    css,
    new RegExp(`${eSelector} \\.how-step::before\\s*\\{[^}]*z-index:\\s*3[^}]*width:\\s*48px[^}]*height:\\s*60px[^}]*padding:\\s*0 0 22px[^}]*clip-path:\\s*polygon\\(0 0, 50% 44%, 100% 0, 96% 56%, 52% 100%, 4% 56%\\)[^}]*background:\\s*var\\(--color-accent\\)`, "s")
  );
  assert.match(
    css,
    new RegExp(`${eSelector} \\.how-step::after\\s*\\{[^}]*content:\\s*"0" counter\\(version-e-step\\)[^}]*top:\\s*-27px[^}]*z-index:\\s*5[^}]*display:\\s*block[^}]*color:\\s*#ffffff`, "s")
  );
});

test("Version D capability rail clears the overlapping hero video", async () => {
  const css = await read("styles.css");

  assert.match(
    css,
    /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) \.capability-rail\s*\{[^}]*margin-top:\s*max\(120px,\s*calc\(520px\s*\+/s,
  );
});

test("Version D capability cards sit in the visual middle below the hero", async () => {
  const css = await read("styles.css");

  assert.match(
    css,
    /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) \.capability-list\s*\{[^}]*transform:\s*translateY\(clamp\(48px,\s*7vh,\s*72px\)\)/s,
  );
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

test("buttons share consistent accent and neutral hover states", async () => {
  const css = await read("styles.css");
  assert.match(css, /\.button-accent:hover,\s*\.hero-primary:hover\s*\{[^}]*background:\s*var\(--color-core-darkest\)[^}]*border-color:\s*var\(--color-accent\)[^}]*color:\s*var\(--color-core-lightest\)/s);
  assert.match(css, /\.hero-secondary:hover,\s*\.play-gallery-action:hover,\s*\.closing-cta-secondary:hover\s*\{[^}]*background:\s*transparent[^}]*border-color:\s*var\(--color-accent\)/s);
  assert.match(css, /body:has\(\.hero-variant-a:not\(\[hidden\]\)\) #play \.play-gallery-action:hover\s*\{[^}]*border-color:\s*var\(--color-accent\)/s);
  assert.doesNotMatch(css, /\.button-accent:hover,[\s\S]*?\.closing-cta-secondary:hover\s*\{[^}]*outline:/s);
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
    /@media\s*\(max-width:\s*480px\)[\s\S]*?\.hero-variant-a \.hero-window\s*\{[^}]*width:\s*100%/s,
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

test("Versions D and E Build use a right-aligned outlined tab on one full-width line", async () => {
  const html = await read("index.html");
  const css = await read("styles.css");

  assert.match(
    html,
    /<section class="feature build-feature reveal"[^>]*>[\s\S]*?<div class="section-track section-track-build" aria-hidden="true">\s*<span class="section-track-tab"><strong>Build<\/strong><\/span>\s*<\/div>/,
  );
  assert.match(
    css,
    /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) #build \.section-track-build\s*\{[^}]*display:\s*flex[^}]*width:\s*100vw[^}]*height:\s*34px[^}]*border-top:\s*1px solid[^}]*border-bottom:\s*0/s,
  );
  assert.match(
    css,
    /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) #build \.section-track-tab\s*\{[^}]*width:\s*140px[^}]*height:\s*34px[^}]*margin-left:\s*auto[^}]*background:\s*var\(--color-border\)[^}]*clip-path:\s*polygon\(0 0, calc\(100% - 24px\) 0, 100% 100%, 24px 100%\)[^}]*transform:\s*none/s,
  );
  assert.match(
    css,
    /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) #build \.section-track-tab::after\s*\{[^}]*display:\s*none/s,
  );
  assert.match(
    css,
    /body:has\(\.hero-variant-d:not\(\[hidden\]\)\) #build \.section-track-tab strong\s*\{[^}]*padding-left:\s*0[^}]*letter-spacing:\s*0\.18em[^}]*transform:\s*none/s,
  );
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

test("Version E keeps its hero title on one desktop line with a compact fallback", async () => {
  const css = await read("styles.css");

  assert.match(
    css,
    /body:has\(\.hero-variant-e:not\(\[hidden\]\)\) \.hero-variant-e \.hero-copy\s*\{[^}]*width:\s*min\(calc\(100% - 40px\),\s*1100px\)/s,
  );
  assert.match(
    css,
    /body:has\(\.hero-variant-e:not\(\[hidden\]\)\) \.hero-variant-e \.hero-title\s*\{[^}]*white-space:\s*nowrap/s,
  );
  assert.match(
    css,
    /@media \(max-width:\s*900px\)[\s\S]*body:has\(\.hero-variant-e:not\(\[hidden\]\)\) \.hero-variant-e \.hero-title\s*\{[^}]*white-space:\s*normal/s,
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
    readFile(resolve(root, "assets/media/play-remix-share.mp4")),
    readFile(resolve(root, "assets/media/build2.mp4")),
    readFile(resolve(root, "assets/media/splash-play-1080.mp4")),
    readFile(resolve(root, "assets/media/highway-racer-hover.mp4")),
    readFile(resolve(root, "assets/media/escape-apocalypse-hover.mp4")),
    readFile(resolve(root, "assets/media/jaws-hover.mp4")),
    readFile(resolve(root, "assets/media/box-dash-hover.mp4")),
    readFile(resolve(root, "assets/media/scuba-diver-hover.mp4")),
    readFile(resolve(root, "assets/media/bloody-tower-hover.mp4")),
    readFile(resolve(root, "assets/images/builder/asset-tree.png")),
    readFile(resolve(root, "assets/images/builder/assistant-panel.png")),
    readFile(resolve(root, "assets/images/grow.png")),
    readFile(resolve(root, "assets/images/trust.png")),
    readFile(resolve(root, "assets/images/highway-racer-thumbnail.png")),
    readFile(resolve(root, "assets/images/escape-apocalypse-thumbnail.png")),
    readFile(resolve(root, "assets/images/scuba-diver-thumbnail.png")),
    readFile(resolve(root, "assets/images/box-dash-thumbnail.png")),
    readFile(resolve(root, "assets/images/bloody-tower-thumbnail.png")),
    readFile(resolve(root, "assets/images/jaws-thumbnail.png")),
    readFile(resolve(root, "assets/icons/level-lab-mark.svg")),
    readFile(resolve(root, "assets/fonts/roboto-300.woff2")),
    readFile(resolve(root, "assets/fonts/roboto-700.woff2")),
  ]);
});
