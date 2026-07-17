import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(resolve(root, relativePath), "utf8");

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
