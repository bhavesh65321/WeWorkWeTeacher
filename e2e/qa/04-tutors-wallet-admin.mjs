import { call, section, test, expect, expectStatus, summary, registerUser, login, uniqueEmail, makeTutor, GOOD_JOB } from "./lib.mjs";
import { sql, setCoins } from "./db.mjs";

const coins = async (u) => (await call("GET", "/wallet", { token: u.token })).json.coinBalance;
const tutor = await registerUser({ email: uniqueEmail("tut"), name: `Zed Tutor ${Date.now()}` });
await makeTutor(tutor.token);
const student = await registerUser({ email: uniqueEmail("stu") });
const FULL = {
  headline: "Experienced maths tutor for boards",
  bio: "Eight years teaching class nine to twelve maths with strong board results.",
  photoUrl: "/uploads/x.png",
  hourlyRateMinor: 50000,
  currency: "INR",
  rateType: "HOURLY",
  city: "Mumbai",
  country: "India",
  modes: ["ONLINE"],
  languages: ["English", "Hindi"],
  skills: [{ name: "Mathematics", level: "EXPERT" }],
};

section("TUTOR PROFILE");
await test("GET /tutors/me works after enabling role", "Blocker", async () => expectStatus(await call("GET", "/tutors/me", { token: tutor.token }), 200));
await test("student without tutor role: /tutors/me → 404", "Medium", async () => expectStatus(await call("GET", "/tutors/me", { token: student.token }), 404));
await test("anonymous /tutors/me → 401", "Blocker", async () => expectStatus(await call("GET", "/tutors/me"), 401));
await test("incomplete profile cannot be published (lists what's missing)", "High", async () => {
  const r = await call("PATCH", "/tutors/me", { token: tutor.token, body: { isPublished: true } });
  expect(r.status === 400 && /Complete your teaching profile/.test(r.text), `status ${r.status} ${r.text.slice(0, 160)}`);
});
await test("full profile saves and publishes; appears in /tutors and /tutors/:slug", "Blocker", async () => {
  const r = await call("PATCH", "/tutors/me", { token: tutor.token, body: { ...FULL, isPublished: true } });
  expectStatus(r, [200, 201]);
  const list = await call("GET", `/tutors?q=${encodeURIComponent(tutor.user.name)}`);
  expect(list.json.some((t) => t.slug === r.json.slug), "published tutor not found by name search");
  expectStatus(await call("GET", `/tutors/${r.json.slug}`), 200);
  tutor.slug = r.json.slug;
});
await test("public tutor payloads never contain email, phone or password", "Blocker", async () => {
  const list = await call("GET", "/tutors");
  const one = await call("GET", `/tutors/${tutor.slug}`);
  expect(!/@qa\.test|passwordHash|"phone"|"email"\s*:/.test(list.text + one.text), "PII leaked on public tutor endpoints");
});
await test("unpublishing hides tutor from listing and slug page", "High", async () => {
  await call("PATCH", "/tutors/me", { token: tutor.token, body: { isPublished: false } });
  expectStatus(await call("GET", `/tutors/${tutor.slug}`), 404);
  expect(!(await call("GET", `/tutors?q=${encodeURIComponent(tutor.user.name)}`)).json.some((t) => t.slug === tutor.slug), "still listed");
  await call("PATCH", "/tutors/me", { token: tutor.token, body: { isPublished: true } });
});
for (const [label, body] of [
  ["31 skills", { skills: Array.from({ length: 31 }, (_, i) => ({ name: `Skill ${i + 10}`, level: "EXPERT" })) }],
  ["skill level invalid", { skills: [{ name: "Maths", level: "GOD" }] }],
  ["empty skills array", { skills: [] }],
  ["negative rate", { hourlyRateMinor: -1 }],
  ["fractional rate", { hourlyRateMinor: 10.5 }],
  ["invalid currency", { currency: "BTC" }],
  ["invalid rateType", { rateType: "YEARLY" }],
  ["unknown field (mass assignment) ratingAvg", { ratingAvg: 5 }],
  ["unknown field userId", { userId: "someone" }],
  ["empty languages", { languages: [] }],
]) {
  await test(`rejects tutor update: ${label}`, "High", async () => {
    const r = await call("PATCH", "/tutors/me", { token: tutor.token, body });
    expect(r.status >= 400 && r.status < 500, `accepted/5xx ${r.status} ${r.text.slice(0, 120)}`);
  });
}
for (const [label, name] of [
  ["profanity", "fuck"],
  ["digits-only '00000111'", "00000111"],
  ["phone number", "Call 9876543210"],
  ["email", "me@gmail.com"],
]) {
  await test(`tutor skill sanitisation: ${label} rejected (same rule as student requirement)`, "High", async () => {
    const r = await call("PATCH", "/tutors/me", { token: tutor.token, body: { skills: [{ name: "Mathematics", level: "EXPERT" }, { name, level: "EXPERT" }] } });
    expect(r.status >= 400 && r.status < 500, `bad skill '${name}' accepted onto public profile`);
  });
}
await test("bio/headline with phone or email is masked on public page", "Blocker", async () => {
  await call("PATCH", "/tutors/me", { token: tutor.token, body: { ...FULL, bio: "Call me directly on 9876543210 or mail tutor@gmail.com for fees and demo class", isPublished: true } });
  const pub = await call("GET", `/tutors/${tutor.slug}`);
  expect(!/9876543210|tutor@gmail\.com/.test(pub.text), "tutor bypasses platform by putting contact in bio (anti-disintermediation gap)");
});
await test("photo upload: non-image / oversize rejected", "High", async () => {
  const fd = new FormData();
  fd.append("file", new Blob(["not an image"], { type: "text/plain" }), "a.txt");
  const r = await fetch("http://localhost:4000/api/tutors/me/photo", { method: "POST", headers: { Authorization: `Bearer ${tutor.token}` }, body: fd });
  expect(r.status === 400, `text file accepted (${r.status})`);
  const big = new FormData();
  big.append("file", new Blob([new Uint8Array(3 * 1024 * 1024)], { type: "image/png" }), "b.png");
  const r2 = await fetch("http://localhost:4000/api/tutors/me/photo", { method: "POST", headers: { Authorization: `Bearer ${tutor.token}` }, body: big });
  expect(r2.status === 400 || r2.status === 413, `3MB accepted (${r2.status})`);
});
await test("photo upload: HTML file renamed .png (wrong magic bytes) rejected", "High", async () => {
  const fd = new FormData();
  fd.append("file", new Blob(["<html><script>alert(1)</script></html>"], { type: "image/png" }), "evil.png");
  const r = await fetch("http://localhost:4000/api/tutors/me/photo", { method: "POST", headers: { Authorization: `Bearer ${tutor.token}` }, body: fd });
  expect(r.status === 400, `fake image accepted (${r.status}) – stored XSS vector via /api/uploads`);
});
await test("photoUrl 'javascript:' scheme rejected", "Medium", async () => {
  const r = await call("PATCH", "/tutors/me", { token: tutor.token, body: { photoUrl: "javascript:alert(1)" } });
  expect(r.status >= 400, "javascript: URL accepted as photoUrl");
});

section("TUTOR SEARCH");
await test("filters (subject/city/mode/q/sort/rate) never 5xx and return arrays", "High", async () => {
  for (const qs of ["subject=Mathematics", "city=Mumbai", "mode=ONLINE", "mode=HOME", "q=maths", "q=%27%20OR%201%3D1", "sort=rating", "sort=price", "sort=zzz", "minRate=1&maxRate=999999", "minRate=abc", "page=-1", "limit=100000", "verified=1"]) {
    const r = await call("GET", `/tutors?${qs}`);
    expect(r.status < 500 && Array.isArray(r.json ?? []), `${qs} → ${r.status} ${r.text.slice(0, 100)}`);
  }
});
await test("/tutors/meta returns subjects & cities", "Medium", async () => expectStatus(await call("GET", "/tutors/meta"), 200));
await test("unknown slug → 404", "Medium", async () => expectStatus(await call("GET", "/tutors/does-not-exist"), 404));
await test("tutor list is capped (no unbounded response)", "Medium", async () => expect((await call("GET", "/tutors")).json.length <= 100, "unbounded"));

section("WALLET & PAYMENTS");
await test("wallet requires auth", "Blocker", async () => expectStatus(await call("GET", "/wallet"), 401));
await test("packs endpoint public & sane", "Medium", async () => {
  const r = await call("GET", "/payments/packs");
  expectStatus(r, 200);
});
await test("sandbox buy of invalid pack sizes rejected (7, -50, 0, '50; DROP')", "Blocker", async () => {
  for (const coins of [7, -50, 0, "50; DROP TABLE", 1e9, null]) {
    const r = await call("POST", "/wallet/buy", { token: student.token, body: { coins } });
    expect(r.status === 400, `coins=${coins} → ${r.status}`);
  }
});
await test("sandbox coins are credited when Stripe is not configured (documented V1 decision; must be OFF at paid launch)", "Info", async () => {
  const before = await coins(student);
  const r = await call("POST", "/wallet/buy", { token: student.token, body: { coins: 50 } });
  expect(r.status < 300 && (await coins(student)) - before === 50, "sandbox purchase not credited as designed");
});
await test("checkout without Stripe runs sandbox flow and writes a SANDBOX payment row", "Info", async () => {
  const r = await call("POST", "/payments/checkout/coins", { token: student.token, body: { coins: 50 } });
  expect(r.status < 300 && r.json.mode === "sandbox", `status ${r.status}`);
});
await test("stripe webhook with forged payload does not credit coins", "Blocker", async () => {
  const before = await coins(student);
  const r = await call("POST", "/payments/stripe/webhook", { body: { type: "checkout.session.completed", data: { object: { metadata: { userId: student.user.id, coins: "500" } } } } });
  expect(r.json?.received !== true && (await coins(student)) === before, `forged webhook status ${r.status} ${r.text}`);
});
await test("payments/confirm with bogus session id does not credit", "High", async () => {
  const before = await coins(student);
  const r = await call("GET", "/payments/confirm?session_id=cs_test_fake", { token: student.token });
  expect(r.status < 500 && (await coins(student)) === before, `status ${r.status}`);
});
await test("premium with insufficient coins → 409 and no premium", "High", async () => {
  const p = await registerUser({ email: uniqueEmail("prem") });
  setCoins(p.user.id, 0);
  expectStatus(await call("POST", "/wallet/premium", { token: p.token }), 409);
  expect((await call("GET", "/wallet", { token: p.token })).json.isPremium === false, "premium granted for free");
});
await test("RACE: 10 parallel spends against balance of 20 never overdraw", "Blocker", async () => {
  const p = await registerUser({ email: uniqueEmail("od") });
  await makeTutor(p.token);
  setCoins(p.user.id, 20);
  const rs = await Promise.all(Array.from({ length: 10 }, () => call("POST", "/wallet/premium", { token: p.token })));
  const bal = (await call("GET", "/wallet", { token: p.token })).json.coinBalance;
  expect(bal >= 0, `balance ${bal}`);
  expect(rs.every((r) => r.status < 500), `5xx: ${rs.map((r) => r.status)}`);
});
await test("ledger sum equals balance after all the above (money integrity)", "Blocker", async () => {
  const rows = sql(`SELECT count(*) FROM "Wallet" w JOIN "User" u ON u.id = w."userId" WHERE u."createdAt" > now() - interval '2 minutes' AND w."coinBalance" <> COALESCE((SELECT sum(amount) FROM "LedgerEntry" l WHERE l."walletId" = w.id AND l.unit = 'COIN'),0)`);
  expect(Number(rows) === 0, `${rows} wallets whose balance != ledger sum (seed users excluded? check)`);
});

section("FLAGS / REPORTING");
const reporter = await registerUser({ email: uniqueEmail("rep") });
const victimJob = await call("POST", "/jobs", { token: student.token, body: { ...GOOD_JOB, title: "Job that gets reported soon" } });
await test("user can report a job", "High", async () => expectStatus(await call("POST", "/flags", { token: reporter.token, body: { targetType: "JOB", targetId: victimJob.json.id, reason: "SPAM" } }), [200, 201]));
await test("cannot report own job → 400", "Medium", async () => expectStatus(await call("POST", "/flags", { token: student.token, body: { targetType: "JOB", targetId: victimJob.json.id, reason: "SPAM" } }), 400));
await test("4th report of same target in 24h → 400", "Medium", async () => {
  const codes = [];
  for (let i = 0; i < 4; i += 1) codes.push((await call("POST", "/flags", { token: reporter.token, body: { targetType: "JOB", targetId: victimJob.json.id, reason: "SPAM" } })).status);
  expect(codes[codes.length - 1] === 400, `codes ${codes}`);
});
await test("malformed report (empty body) → 400 not 500", "High", async () => {
  const r = await call("POST", "/flags", { token: reporter.token, body: {} });
  expect(r.status === 400, `status ${r.status}`);
});
await test("report of nonexistent target → 4xx not 500", "Medium", async () => {
  const r = await call("POST", "/flags", { token: reporter.token, body: { targetType: "JOB", targetId: "ghost", reason: "SPAM" } });
  expect(r.status >= 400 && r.status < 500, `status ${r.status}`);
});
await test("anonymous cannot report → 401", "High", async () => expectStatus(await call("POST", "/flags", { body: { targetType: "JOB", targetId: "x", reason: "SPAM" } }), 401));
await test("non-admin GET /flags → 403 (not 500)", "High", async () => expectStatus(await call("GET", "/flags", { token: reporter.token }), 403));

section("ADMIN & AUTHZ MATRIX");
const adminToken = await login("admin@gurumates.dev");
await test("admin GET /flags → 200", "High", async () => {
  const r = await call("GET", "/flags", { token: adminToken });
  expect(r.status === 200, `admin cannot open flags queue (status ${r.status}) – moderation UI is dead`);
});
const adminRoutes = [
  ["GET", "/admin/overview"],
  ["GET", "/admin/metrics"],
  ["POST", "/admin/credit", { userId: "x", coins: 5, note: "qa" }],
  ["POST", "/admin/refund-unread"],
  ["POST", "/admin/flags", { targetType: "JOB", targetId: "x", reason: "SPAM spam spam" }],
  ["POST", "/admin/jobs/x/spam"],
  ["POST", "/admin/tickets/x/close"],
  ["POST", "/admin/users/x/block", { userId: "x", reason: "abusive behaviour" }],
  ["POST", "/admin/users/x/unblock"],
  ["POST", "/flags/x/dismiss"],
  ["POST", "/flags/x/resolve"],
  ["POST", "/flags/x/block"],
];
for (const [method, path, body] of adminRoutes) {
  await test(`non-admin blocked from ${method} ${path}`, "Blocker", async () => {
    const r = await call(method, path, { token: student.token, body });
    expect(r.status === 403, `student got ${r.status}`);
  });
  await test(`anonymous blocked from ${method} ${path}`, "Blocker", async () => {
    const r = await call(method, path, { body });
    expect(r.status === 401, `anon got ${r.status}`);
  });
}
await test("admin overview & metrics load", "Medium", async () => {
  expectStatus(await call("GET", "/admin/overview", { token: adminToken }), 200);
  expectStatus(await call("GET", "/admin/metrics", { token: adminToken }), 200);
});
await test("admin credit negative / zero / string coins rejected", "High", async () => {
  for (const coins of [-100, 0, "abc", 1.5]) expect((await call("POST", "/admin/credit", { token: adminToken, body: { userId: student.user.id, coins } })).status === 400, `coins=${coins}`);
});
await test("admin block → blocked user cannot login/post/apply/use old token; unblock restores", "Blocker", async () => {
  const v = await registerUser({ email: uniqueEmail("blk") });
  await makeTutor(v.token);
  const b = await call("POST", `/admin/users/${v.user.id}/block`, { token: adminToken, body: { userId: v.user.id, reason: "violating the rules repeatedly" } });
  expectStatus(b, [200, 201]);
  expectStatus(await call("POST", "/auth/login", { body: { email: v.user.email, password: v.password } }), 403);
  expectStatus(await call("GET", "/auth/me", { token: v.token }), 403);
  expectStatus(await call("POST", "/jobs", { token: v.token, body: { ...GOOD_JOB, title: "Blocked user posting" } }), 403);
  expectStatus(await call("POST", `/admin/users/${v.user.id}/unblock`, { token: adminToken }), [200, 201]);
  expectStatus(await call("POST", "/auth/login", { body: { email: v.user.email, password: v.password } }), [200, 201]);
});
await test("admin cannot block themselves", "Medium", async () => {
  const me = await call("GET", "/auth/me", { token: adminToken });
  expectStatus(await call("POST", `/admin/users/${me.json.id}/block`, { token: adminToken, body: { userId: me.json.id, reason: "testing self block" } }), 403);
});
await test("blocking a nonexistent user → 404 (not misleading 403)", "Low", async () => {
  expectStatus(await call("POST", "/admin/users/ghost/block", { token: adminToken, body: { userId: "ghost", reason: "does not exist at all" } }), 404);
});
await test("deleted user's old token cannot create content", "High", async () => {
  const g = await registerUser({ email: uniqueEmail("ghost") });
  await call("DELETE", "/auth/me", { token: g.token });
  const r = await call("POST", "/jobs", { token: g.token, body: { ...GOOD_JOB, title: "Posting after account deletion" } });
  expect(r.status === 401, `deleted account can still act with old JWT (status ${r.status})`);
});

section("NOTIFICATIONS & SUPPORT");
await test("notifications list/read-all work", "Medium", async () => {
  expectStatus(await call("GET", "/notifications", { token: student.token }), 200);
  expectStatus(await call("POST", "/notifications/read", { token: student.token, body: {} }), [200, 201]);
});
await test("cannot mark another user's notification as read (IDOR)", "High", async () => {
  const id = sql(`SELECT id FROM "Notification" WHERE "userId" <> '${reporter.user.id}' LIMIT 1`);
  if (!id) return;
  const before = sql(`SELECT "readAt" IS NULL FROM "Notification" WHERE id='${id}'`);
  await call("POST", `/notifications/${id}/read`, { token: reporter.token, body: {} });
  const after = sql(`SELECT "readAt" IS NULL FROM "Notification" WHERE id='${id}'`);
  expect(before === after, "foreign notification modified");
});
await test("support ticket: valid anonymous ticket accepted", "Medium", async () => {
  expectStatus(await call("POST", "/support", { body: { name: "Asha", email: "asha@qa.test", topic: "Billing", body: "I was charged twice for coins." } }), [200, 201]);
});
await test("support ticket validation: bad email / empty body / huge body", "Medium", async () => {
  expect((await call("POST", "/support", { body: { name: "A", email: "nope", topic: "x", body: "hello there" } })).status === 400, "bad email accepted");
  expect((await call("POST", "/support", { body: {} })).status === 400, "empty accepted");
  const huge = await call("POST", "/support", { body: { name: "Asha", email: "asha@qa.test", topic: "Billing", body: "x".repeat(200000) } });
  expect(huge.status === 400 || huge.status === 413, `200KB ticket accepted (${huge.status})`);
});

const { failed } = summary();
process.exit(failed.length ? 1 : 0);
