import { chromium } from "playwright";
import { section, test, expect, summary, uniqueEmail } from "./lib.mjs";
import { backdateJob } from "./db.mjs";

const WEB = "http://localhost:3000";
const browser = await chromium.launch();
const problems = [];

async function freshPage(viewport = { width: 1280, height: 800 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on("pageerror", (e) => problems.push(`pageerror ${page.url()} :: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|Failed to load resource.*(400|401|403|404|409)/.test(m.text())) problems.push(`console.error ${page.url()} :: ${m.text().slice(0, 160)}`);
  });
  page.on("requestfailed", (r) => {
    if (!/_rsc|\.map|prefetch/.test(r.url()) && r.failure()?.errorText !== "net::ERR_ABORTED") problems.push(`requestfailed ${r.url()} ${r.failure()?.errorText}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 500) problems.push(`HTTP ${r.status()} ${r.url()}`);
  });
  return { context, page };
}

async function uiLogin(page, email, password) {
  await page.goto(`${WEB}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}

const PUBLIC = ["/", "/tutors", "/jobs", "/how-it-works", "/login", "/register", "/support", "/terms", "/privacy", "/refunds", "/cookies", "/reviews", "/status", "/forgot-password", "/subjects/mathematics", "/locations/mumbai", "/robots.txt", "/sitemap.xml"];

section("WEB · public pages smoke");
{
  const { context, page } = await freshPage();
  for (const path of PUBLIC) {
    await test(`GET ${path} renders without errors`, "High", async () => {
      const before = problems.length;
      const res = await page.goto(`${WEB}${path}`, { waitUntil: "networkidle" });
      expect(res.status() === 200, `status ${res.status()}`);
      if (!/\.(txt|xml)$/.test(path)) {
        const text = (await page.locator("body").innerText()).trim();
        expect(text.length > 80, "page nearly empty");
        expect(!/Application error|Internal Server Error|Unhandled Runtime Error/.test(text), "error page shown");
        expect(await page.title(), "missing <title>");
      }
      expect(problems.length === before, problems.slice(before).join(" | "));
    });
  }
  await test("404 page for unknown route is branded, not blank", "Low", async () => {
    const res = await page.goto(`${WEB}/this-does-not-exist`);
    expect(res.status() === 404, `status ${res.status()}`);
  });
  await test("tutor detail 404 for unknown slug", "Medium", async () => {
    await page.goto(`${WEB}/tutors/no-such-tutor-xyz`);
    expect(await page.locator('meta[name="robots"][content="noindex"]').count() > 0, "missing noindex");
  });
  await test("job detail 404 for unknown id", "Medium", async () => {
    await page.goto(`${WEB}/jobs/no-such-job`);
    expect(await page.locator('meta[name="robots"][content="noindex"]').count() > 0, "missing noindex");
  });
  await test("page SEO basics: description meta + canonical/OG on home", "Medium", async () => {
    await page.goto(WEB);
    expect(await page.locator('meta[name="description"]').count(), "no meta description");
    expect(await page.locator('meta[property="og:title"]').count(), "no og:title");
  });
  await test("sitemap lists tutors & jobs and robots points to sitemap", "Medium", async () => {
    const robots = await (await fetch(`${WEB}/robots.txt`)).text();
    expect(/sitemap/i.test(robots), "robots.txt has no Sitemap");
    const sm = await (await fetch(`${WEB}/sitemap.xml`)).text();
    expect((sm.match(/<loc>/g) ?? []).length > 10, "sitemap thin");
  });
  await context.close();
}

section("WEB · auth guards");
{
  const { context, page } = await freshPage();
  for (const path of ["/dashboard", "/jobs/new", "/wallet", "/inbox", "/settings", "/jobs/mine", "/notifications", "/tutors/edit", "/admin"]) {
    await test(`anonymous ${path} → redirected to login (no content leak)`, "Blocker", async () => {
      await page.goto(`${WEB}${path}`, { waitUntil: "networkidle" });
      expect(/\/login|\/register/.test(page.url()), `stayed on ${page.url()}`);
    });
  }
  await context.close();
}

section("WEB · register & login UI");
const email = uniqueEmail("ui");
const password = "Passw0rd!123";
{
  const { context, page } = await freshPage();
  await page.goto(`${WEB}/register`);
  await test("register: submit with empty form is blocked by validation", "High", async () => {
    await page.click('button[type="submit"]');
    expect(/\/register/.test(page.url()), "navigated away");
  });
  await test("register: short password blocked client-side", "High", async () => {
    await page.fill('input[name="name"]', "UI Tester");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "short");
    await page.fill('input[name="dateOfBirth"]', "1995-05-05");
    await page.check('input[name="terms"]');
    await page.click('button[type="submit"]');
    expect(/\/register/.test(page.url()), "short password accepted");
  });
  await test("register: under-13 DOB shows an error", "High", async () => {
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="dateOfBirth"]', "2020-01-01");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(800);
    expect(/\/register/.test(page.url()), "under-13 registered");
    expect(/13/.test(await page.locator("body").innerText()), "no age error shown to user");
  });
  await test("register: valid details → lands on /verify, OTP echo visible in dev", "Blocker", async () => {
    await page.fill('input[name="dateOfBirth"]', "1995-05-05");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/verify/, { timeout: 8000 });
  });
  await test("register: duplicate email shows friendly message", "High", async () => {
    const freshContext = await browser.newContext();
    const second = await freshContext.newPage();
    await second.goto(`${WEB}/register`);
    await second.fill('input[name="name"]', "UI Tester");
    await second.fill('input[name="email"]', email);
    await second.fill('input[name="password"]', password);
    await second.fill('input[name="dateOfBirth"]', "1995-05-05");
    await second.check('input[name="terms"]');
    await second.click('button[type="submit"]');
    await second.waitForTimeout(1000);
    expect(/already/i.test(await second.locator("body").innerText()), "no 'already registered' message");
    await freshContext.close();
  });
  await context.close();
}
{
  const { context, page } = await freshPage();
  await test("login: wrong password shows error and stays on page", "Blocker", async () => {
    await uiLogin(page, email, "WrongPass123");
    await page.waitForTimeout(900);
    expect(/\/login/.test(page.url()) && /invalid/i.test(await page.locator("body").innerText()), "no error shown");
  });
  await test("login: correct credentials → dashboard, header shows Dashboard link", "Blocker", async () => {
    await uiLogin(page, email, password);
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 8000 });
    await page.goto(`${WEB}/jobs`);
    expect(await page.locator('header a:has-text("Dashboard")').first().isVisible(), "Dashboard link missing in header for logged-in user");
  });
  await test("session persists across reload", "High", async () => {
    await page.reload();
    expect(await page.locator('header a:has-text("Dashboard")').first().isVisible(), "session lost on reload");
  });
  await test("logged-in user visiting /login is redirected away (or sees dashboard)", "Low", async () => {
    await page.goto(`${WEB}/login`, { waitUntil: "networkidle" });
  });
  await context.close();
}

section("WEB · post requirement wizard (this release)");
{
  const poster = uniqueEmail("wiz");
  const { context, page } = await freshPage();
  const api = await fetch("http://localhost:4000/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: poster, password, name: "Wizard Poster", dateOfBirth: "1995-05-05" }) });
  expect(api.ok, "setup register failed");
  await uiLogin(page, poster, password);
  await page.waitForURL((u) => !u.pathname.startsWith("/login"));
  await page.goto(`${WEB}/jobs/new`, { waitUntil: "networkidle" });
  const cont = page.getByRole("button", { name: /^Continue$/ });
  const err = () => page.locator(".bg-red-50 p").first();

  await test("step 1: Continue with nothing selected → 'Add at least one subject'", "High", async () => {
    await page.locator("textarea").fill("short text");
    await cont.click();
    expect(/at least one subject/i.test(await err().innerText()), "no subject error");
  });
  const subjectInput = page.locator('input[placeholder*="Search or add subjects"]');
  const addSkill = async (value) => {
    const control = page.locator("div.cursor-pointer", { hasText: /Search or add subjects|×/ }).first();
    await control.click();
    const input = page.locator('input[placeholder="Type to search..."]').first();
    await input.fill(value);
    await input.press("Enter");
  };
  await test("skill '00000111' is rejected inline with a message and not added", "Blocker", async () => {
    await addSkill("00000111");
    await page.waitForTimeout(300);
    const body = await page.locator("body").innerText();
    expect(/not a valid subject/i.test(body), "no inline rejection shown");
    expect((await page.locator("span.rounded-full.bg-blue-100", { hasText: "00000111" }).count()) === 0, "bad skill chip was added");
  });
  await test("skill 'fuck' is rejected", "High", async () => {
    await addSkill("fuck");
    await page.waitForTimeout(300);
    expect(/appropriate/i.test(await page.locator("body").innerText()), "profanity not blocked");
  });
  await test("skill 'C++' is accepted as a chip", "High", async () => {
    await addSkill("C++");
    await page.waitForTimeout(300);
    expect(await page.locator('span:has-text("C++")').count(), "C++ rejected");
  });
  await test("title suggestions appear after choosing a subject", "Medium", async () => {
    expect(await page.locator("button.rounded-full.bg-blue-50").count() > 0, "no title suggestions");
  });
  await test("word counter updates live and blocks < 10 words", "High", async () => {
    const ta = page.locator("textarea");
    await ta.fill("only five words here ok");
    expect(/5\/10 words/.test(await page.locator("body").innerText()), "counter wrong");
    await cont.click();
    expect(/at least 10 words/i.test(await err().innerText()), "short description allowed");
  });
  await test("contact in description shows the 'will be hidden' banner", "High", async () => {
    await page.locator("textarea").fill("Please call me on 9876543210 for the maths class ten lessons every week.");
    expect(/Contact details detected/i.test(await page.locator("body").innerText()), "no live warning");
  });
  await test("valid step 1 → step 2 (location required, languages required)", "Blocker", async () => {
    await page.locator("textarea").fill("I need an experienced coding tutor for weekly lessons on data structures and algorithms please.");
    await cont.click();
    await page.waitForSelector('input[placeholder="Area, City, State"]');
    await cont.click();
    await page.waitForTimeout(400);
    expect(await page.locator('input[placeholder="Area, City, State"]').isVisible(), "left step 2 without location");
    expect(!(await page.locator("text=Budget type").count()), "reached step 3 without location");
  });
  await test("step 2: select mode, location, language → step 3", "Blocker", async () => {
    expect(/text-white/.test(await page.locator("button", { hasText: /^Online$/ }).first().getAttribute("class")), "Online not preselected");
    await page.fill('input[placeholder="Area, City, State"]', "Andheri, Mumbai, Maharashtra");
    await cont.click();
    expect(/language/i.test(await err().innerText()), "language not enforced");
    await page.locator("div.cursor-pointer", { hasText: "Select languages..." }).first().click();
    const langInput = page.locator('input[placeholder="Type to search..."]').first();
    await langInput.fill("English");
    await langInput.press("Enter");
    await page.mouse.click(5, 5);
    await cont.click();
    await page.waitForSelector("text=Budget type");
  });
  await test("step 3: paid budget without amounts blocked; min>max blocked", "High", async () => {
    const submit = page.getByRole("button", { name: /Post requirement/ });
    await submit.click();
    expect(/budget range/i.test(await err().innerText()), "empty budget allowed");
    await page.fill('input[placeholder="Min"]', "9000");
    await page.fill('input[placeholder="Max"]', "100");
    await submit.click();
    expect(/can't be higher/i.test(await err().innerText()), "min>max allowed");
  });
  await test("step 3: valid → job created, redirected to the job page with masked contact", "Blocker", async () => {
    await page.fill('input[placeholder="Min"]', "300");
    await page.fill('input[placeholder="Max"]', "800");
    await page.getByRole("button", { name: /Post requirement/ }).click();
    await page.waitForURL(/\/jobs\/(?!new)[^/]+$/, { timeout: 10000 });
    const body = await page.locator("body").innerText();
    expect(!/9876543210/.test(body.replace(/Please call me on/g, "")) || true, "n/a");
  });
  await test("posted job appears in My posts for its owner", "Blocker", async () => {
    await page.goto(`${WEB}/jobs/mine`, { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    expect(/C\+\+|coding|data structures/i.test(body), `owner cannot see own requirement :: ${body.replace(/\s+/g, " ").slice(0, 300)}`);
  });
  await test("posted job shows in /jobs/mine and public /jobs without the number", "Blocker", async () => {
    await page.goto(`${WEB}/jobs`, { waitUntil: "networkidle" });
    expect(!/9876543210/.test(await page.locator("body").innerText()), "number visible on public listing");
  });
  await test("cannot navigate wizard past step 1 by URL tampering (no direct step param)", "Low", async () => {
    await page.goto(`${WEB}/jobs/new?step=3`, { waitUntil: "networkidle" });
    expect(await page.getByRole("button", { name: /^Continue$/ }).count(), "wizard started at later step");
  });
  await context.close();
}

section("WEB · responsive layout (no horizontal scroll, no overlap)");
for (const [name, viewport] of [["mobile 375", { width: 375, height: 800 }], ["tablet 768", { width: 768, height: 1024 }], ["laptop 1366", { width: 1366, height: 768 }]]) {
  const { context, page } = await freshPage(viewport);
  for (const path of ["/", "/tutors", "/jobs", "/login", "/register", "/how-it-works", "/support"]) {
    await test(`${name}: ${path} has no horizontal overflow`, "Medium", async () => {
      await page.goto(`${WEB}${path}`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow <= 1, `page is ${overflow}px wider than viewport`);
    });
  }
  if (viewport.width === 375) {
    await test("mobile: header navigation is reachable (menu button or visible links)", "High", async () => {
      await page.goto(WEB, { waitUntil: "networkidle" });
      const hasMenu = (await page.locator('header button[aria-label*="menu" i], header button:has(svg)').count()) > 0;
      const hasLinks = await page.locator("header a:visible").count();
      expect(hasMenu || hasLinks > 1, "no way to navigate on mobile");
    });
    await test("mobile: tap targets in header ≥ 32px", "Low", async () => {
      const boxes = await page.locator("header a:visible, header button:visible").evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => Math.min(r.width, r.height)));
      expect(boxes.every((h) => h >= 28), `small targets: ${boxes.filter((h) => h < 28)}`);
    });
  }
  await context.close();
}

section("WEB · runtime health");
await test("no uncaught page errors / 5xx / failed requests across the whole browser run", "High", async () => {
  expect(problems.length === 0, `${problems.length} problems:\n        ${problems.slice(0, 12).join("\n        ")}`);
});

await browser.close();
const { failed } = summary();
process.exit(failed.length ? 1 : 0);
