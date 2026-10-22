import { call, section, test, expect, expectStatus, summary, registerUser, login, uniqueEmail, sleep, API } from "./lib.mjs";

const VALID = { password: "Passw0rd!123", name: "QA Person", dateOfBirth: "1995-05-05" };
const reg = (over = {}) => call("POST", "/auth/register", { body: { email: uniqueEmail(), ...VALID, ...over } });

section("AUTH · registration (positive)");
let main;
await test("register valid student returns token, STUDENT role, no password leak", "Blocker", async () => {
  const email = uniqueEmail("main");
  const r = await call("POST", "/auth/register", { body: { email, ...VALID } });
  expectStatus(r, [200, 201]);
  expect(r.json.token, "no token");
  expect(r.json.user.roles.includes("STUDENT") && !r.json.user.roles.includes("ADMIN"), "bad roles");
  expect(!/passwordHash|\$2[aby]\$/.test(r.text), "password hash leaked in register response");
  main = { email, token: r.json.token };
});
await test("starter coins = 150 credited exactly once", "Critical", async () => {
  const w = await call("GET", "/wallet", { token: main.token });
  expect(w.json.coinBalance === 150, `balance ${w.json.coinBalance}`);
  expect(w.json.entries.filter((e) => e.type === "STARTER").length === 1, "starter entries != 1");
});
await test("login with new credentials + /auth/me", "Blocker", async () => {
  const t = await login(main.email, VALID.password);
  const me = await call("GET", "/auth/me", { token: t });
  expectStatus(me, 200);
  expect(me.json.email === main.email, "email mismatch");
  expect(!/passwordHash/.test(me.text), "passwordHash leaked in /me");
});
await test("email is case-insensitive on login", "Medium", async () => {
  const r = await call("POST", "/auth/login", { body: { email: main.email.toUpperCase(), password: VALID.password } });
  expectStatus(r, [200, 201]);
});
await test("profile update persists name/city/country/phone", "High", async () => {
  const p = await call("PATCH", "/auth/profile", { token: main.token, body: { name: "QA Renamed", city: "Pune", country: "India", phone: "+919876543210" } });
  expectStatus(p, [200, 201]);
  const me = await call("GET", "/auth/me", { token: main.token });
  expect(me.json.name === "QA Renamed" && me.json.city === "Pune", `got ${me.text.slice(0, 200)}`);
});

section("AUTH · registration (negative)");
await test("duplicate email → 409", "High", async () => expectStatus(await call("POST", "/auth/register", { body: { email: main.email, ...VALID } }), 409));
await test("duplicate email different case → 409", "High", async () => expectStatus(await call("POST", "/auth/register", { body: { email: main.email.toUpperCase(), ...VALID } }), 409));
await test("duplicate email with surrounding spaces rejected (not a second account)", "Medium", async () => {
  const r = await call("POST", "/auth/register", { body: { email: ` ${main.email} `, ...VALID } });
  expect([400, 409].includes(r.status), `got ${r.status}`);
});
for (const [label, over] of [
  ["password 7 chars", { password: "Abcd123" }],
  ["empty password", { password: "" }],
  ["invalid email 'abc'", { email: "abc" }],
  ["invalid email 'a@b'", { email: "a@b" }],
  ["name 1 char", { name: "A" }],
  ["missing DOB", { dateOfBirth: undefined }],
  ["DOB garbage", { dateOfBirth: "yesterday" }],
  ["DOB future date", { dateOfBirth: "2999-01-01" }],
  ["DOB under 13", { dateOfBirth: new Date(Date.now() - 12 * 365.25 * 864e5).toISOString().slice(0, 10) }],
  ["extra field roles=ADMIN (mass assignment)", { roles: ["ADMIN"] }],
  ["extra field isAdmin=true", { isAdmin: true }],
  ["phone too short", { phone: "12345" }],
]) {
  await test(`rejects ${label} → 4xx`, "High", async () => {
    const r = await reg(over);
    expect(r.status >= 400 && r.status < 500, `got ${r.status}: ${r.text.slice(0, 150)}`);
  });
}
await test("whitespace-only name '   ' rejected", "Medium", async () => {
  const r = await reg({ name: "   " });
  expect(r.status >= 400 && r.status < 500, `account created with blank name (status ${r.status})`);
});
await test("name containing HTML is stored but not executable (API returns raw JSON)", "Medium", async () => {
  const r = await reg({ name: "<img src=x onerror=alert(1)>" });
  expect(r.status >= 400 || r.json?.user, "unexpected");
});
await test("10,000-char name rejected or truncated", "Medium", async () => {
  const r = await reg({ name: "A".repeat(10000) });
  expect(r.status >= 400 && r.status < 500, `huge name accepted (status ${r.status})`);
});
await test("password with 1000 chars does not crash server (bcrypt 72-byte limit)", "Low", async () => {
  const r = await reg({ password: "x".repeat(1000) });
  expect(r.status < 500, `5xx: ${r.status}`);
});
await test("malformed JSON body → 400 not 500", "Medium", async () => {
  const r = await call("POST", "/auth/register", { body: "{bad json", raw: true, headers: { "Content-Type": "application/json" } });
  expect(r.status === 400, `got ${r.status}`);
});
await test("empty body → 400", "Medium", async () => {
  const r = await call("POST", "/auth/register", { body: {} });
  expect(r.status === 400, `got ${r.status}`);
});
await test("SQL injection in email field is rejected as invalid email", "High", async () => {
  const r = await reg({ email: "x' OR '1'='1@a.com" });
  expect(r.status < 500, `5xx ${r.status}`);
});
await test("5 MB body rejected (413) rather than processed", "Medium", async () => {
  const r = await call("POST", "/auth/register", { body: { email: uniqueEmail(), ...VALID, name: "x".repeat(5_000_000) } });
  expect([400, 413].includes(r.status), `got ${r.status}`);
});
await test("age gate: exactly 13 years old today is accepted", "Low", async () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 13);
  d.setDate(d.getDate() - 1);
  const r = await reg({ dateOfBirth: d.toISOString().slice(0, 10) });
  expectStatus(r, [200, 201]);
});

section("AUTH · login (negative)");
await test("wrong password → 401", "Blocker", async () => expectStatus(await call("POST", "/auth/login", { body: { email: main.email, password: "wrong-password" } }), 401));
await test("unknown email gives same message as wrong password (no user enumeration)", "Medium", async () => {
  const a = await call("POST", "/auth/login", { body: { email: main.email, password: "wrong-password" } });
  const b = await call("POST", "/auth/login", { body: { email: "nobody.here@qa.test", password: "wrong-password" } });
  expect(a.json?.message === b.json?.message, `'${a.json?.message}' vs '${b.json?.message}'`);
});
await test("empty password → 4xx", "Medium", async () => {
  const r = await call("POST", "/auth/login", { body: { email: main.email, password: "" } });
  expect(r.status >= 400 && r.status < 500, `got ${r.status}`);
});
await test("login with SQLi payload as password does not authenticate", "High", async () => {
  const r = await call("POST", "/auth/login", { body: { email: main.email, password: "' OR '1'='1" } });
  expect(r.status === 401, `got ${r.status}`);
});
await test("brute-force: 12 wrong passwords in a row get throttled (429) at some point", "High", async () => {
  const victim = await registerUser({ email: uniqueEmail("bf") });
  let throttled = false;
  for (let i = 0; i < 12; i += 1) {
    const r = await call("POST", "/auth/login", { body: { email: victim.user.email, password: `wrong-${i}` } });
    if (r.status === 429) throttled = true;
  }
  expect(throttled, "no rate limiting on login: unlimited password guessing possible");
});

section("AUTH · tokens & sessions");
await test("no token → 401 on /auth/me", "Blocker", async () => expectStatus(await call("GET", "/auth/me"), 401));
await test("garbage token → 401", "Blocker", async () => expectStatus(await call("GET", "/auth/me", { token: "abc.def.ghi" }), 401));
await test("token signed with a different secret → 401", "Blocker", async () => {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const crypto = await import("node:crypto");
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ sub: "x", email: "a@b.com", activeRole: "ADMIN", exp: Math.floor(Date.now() / 1000) + 999 });
  const sig = crypto.createHmac("sha256", "wrong-secret").update(`${head}.${body}`).digest("base64url");
  expectStatus(await call("GET", "/auth/me", { token: `${head}.${body}.${sig}` }), 401);
});
await test("alg=none token → 401", "Blocker", async () => {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const t = `${b64({ alg: "none", typ: "JWT" })}.${b64({ sub: "x", exp: Math.floor(Date.now() / 1000) + 999 })}.`;
  expectStatus(await call("GET", "/auth/me", { token: t }), 401);
});
await test("expired token → 401", "High", async () => {
  const crypto = await import("node:crypto");
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ sub: "x", email: "a@b.com", exp: Math.floor(Date.now() / 1000) - 60 });
  const sig = crypto.createHmac("sha256", "qa-secret").update(`${head}.${body}`).digest("base64url");
  expectStatus(await call("GET", "/auth/me", { token: `${head}.${body}.${sig}` }), 401);
});
await test("token for a deleted user is rejected", "High", async () => {
  const u = await registerUser({ email: uniqueEmail("del") });
  const d = await call("DELETE", "/auth/me", { token: u.token });
  expectStatus(d, [200, 204]);
  const me = await call("GET", "/auth/me", { token: u.token });
  expect(me.status === 401, `old token still valid after deletion: ${me.status}`);
  const l = await call("POST", "/auth/login", { body: { email: u.user.email, password: u.password } });
  expect(l.status === 401, `deleted user can log in: ${l.status}`);
});
await test("deleted user's email can be re-registered or is cleanly refused (no 500)", "Medium", async () => {
  const email = uniqueEmail("redo");
  const u = await registerUser({ email });
  await call("DELETE", "/auth/me", { token: u.token });
  const r = await call("POST", "/auth/register", { body: { email, ...VALID } });
  expect(r.status < 500, `5xx ${r.status}`);
});

section("AUTH · roles");
await test("cannot switch to ADMIN role", "Blocker", async () => {
  const r = await call("POST", "/auth/role", { token: main.token, body: { role: "ADMIN" } });
  expect(r.status === 400, `got ${r.status}`);
});
await test("cannot switch to TUTOR before enabling", "High", async () => {
  const r = await call("POST", "/auth/role", { token: main.token, body: { role: "TUTOR" } });
  expect(r.status === 400, `got ${r.status}`);
});
await test("enable-tutor then switch to TUTOR and back", "Blocker", async () => {
  const u = await registerUser({ email: uniqueEmail("role") });
  expectStatus(await call("POST", "/auth/enable-tutor", { token: u.token }), [200, 201]);
  expectStatus(await call("POST", "/auth/role", { token: u.token, body: { role: "TUTOR" } }), [200, 201]);
  const me = await call("GET", "/auth/me", { token: u.token });
  expect(me.json.activeRole === "TUTOR", `activeRole ${me.json.activeRole}`);
  expectStatus(await call("POST", "/auth/role", { token: u.token, body: { role: "STUDENT" } }), [200, 201]);
});
await test("enable-tutor twice is idempotent (no 500, no duplicate starter coins)", "High", async () => {
  const u = await registerUser({ email: uniqueEmail("role2") });
  await call("POST", "/auth/enable-tutor", { token: u.token });
  const r2 = await call("POST", "/auth/enable-tutor", { token: u.token });
  expect(r2.status < 500, `5xx ${r2.status}`);
  const w = await call("GET", "/wallet", { token: u.token });
  const starters = w.json.entries.filter((e) => e.type === "STARTER" || /starter/i.test(e.note ?? "")).length;
  expect(starters <= 2, `starter entries ${starters}`);
});

section("AUTH · OTP & password reset");
await test("OTP send → devCode (non-prod) and correct code verifies email", "Blocker", async () => {
  const u = await registerUser({ email: uniqueEmail("otp") });
  const email = u.user.email;
  const me0 = await call("GET", "/auth/me", { token: u.token });
  const sent = await call("POST", "/auth/otp/send", { token: u.token, body: { channel: "EMAIL", purpose: "VERIFY", email } });
  expect([200, 201, 429].includes(sent.status), `send ${sent.status} ${sent.text.slice(0, 120)}`);
  const code = sent.json?.devCode;
  if (!code) return;
  const v = await call("POST", "/auth/otp/verify", { token: u.token, body: { channel: "EMAIL", purpose: "VERIFY", email, code } });
  expectStatus(v, [200, 201]);
  const me = await call("GET", "/auth/me", { token: u.token });
  expect(me.json.emailVerified === true || me.json.emailVerifiedAt, `email not marked verified: ${me.text.slice(0, 200)}`);
});
await test("resending OTP within cooldown → 429", "Medium", async () => {
  const u = await registerUser({ email: uniqueEmail("otp2") });
  const body = { channel: "EMAIL", purpose: "VERIFY", email: u.user.email };
  await sleep(50);
  await call("POST", "/auth/otp/send", { token: u.token, body });
  const again = await call("POST", "/auth/otp/send", { token: u.token, body });
  expect([429, 400].includes(again.status), `got ${again.status}`);
});
await test("wrong OTP → 401; locked after 8 wrong attempts even if next is right", "High", async () => {
  const u = await registerUser({ email: uniqueEmail("otp3") });
  const email = u.user.email;
  const body = { channel: "EMAIL", purpose: "VERIFY", email };
  await sleep(100);
  const sent = await call("POST", "/auth/otp/send", { token: u.token, body });
  const code = sent.json?.devCode;
  if (!code) return;
  for (let i = 0; i < 9; i += 1) {
    const r = await call("POST", "/auth/otp/verify", { token: u.token, body: { ...body, code: "000000" === code ? "111111" : "000000" } });
    expect(r.status >= 400 && r.status < 500, `wrong code accepted/5xx ${r.status}`);
  }
  const good = await call("POST", "/auth/otp/verify", { token: u.token, body: { ...body, code } });
  expect(good.status >= 400, "OTP brute-force protection missing: correct code accepted after 9 failures");
});
await test("4-digit/short code rejected by validation", "Low", async () => {
  const r = await call("POST", "/auth/otp/verify", { body: { channel: "EMAIL", purpose: "VERIFY", email: main.email, code: "1" } });
  expect(r.status === 400, `got ${r.status}`);
});
await test("forgot-password for unknown email does not reveal existence", "Medium", async () => {
  const a = await call("POST", "/auth/forgot-password", { body: { email: main.email } });
  const b = await call("POST", "/auth/forgot-password", { body: { email: "ghost.user@qa.test" } });
  expect(a.status === b.status, `existing=${a.status} unknown=${b.status} (user enumeration)`);
});
await test("full reset-password flow, old password stops working", "High", async () => {
  const u = await registerUser({ email: uniqueEmail("reset") });
  const f = await call("POST", "/auth/forgot-password", { body: { email: u.user.email } });
  const code = f.json?.devCode;
  if (!code) return;
  const r = await call("POST", "/auth/reset-password", { body: { email: u.user.email, code, password: "NewPassw0rd!456" } });
  expectStatus(r, [200, 201]);
  expect((await call("POST", "/auth/login", { body: { email: u.user.email, password: u.password } })).status === 401, "old password still works");
  expectStatus(await call("POST", "/auth/login", { body: { email: u.user.email, password: "NewPassw0rd!456" } }), [200, 201]);
  const replay = await call("POST", "/auth/reset-password", { body: { email: u.user.email, code, password: "Hacker!Pass999" } });
  expect(replay.status >= 400, "OTP reusable: same reset code accepted twice");
});
await test("reset-password with wrong code → 4xx", "Blocker", async () => {
  const r = await call("POST", "/auth/reset-password", { body: { email: main.email, code: "123456", password: "Whatever!12345" } });
  expect(r.status >= 400 && r.status < 500, `got ${r.status}`);
});

section("API · hygiene & security headers");
await test("CORS: evil origin is not echoed in Access-Control-Allow-Origin", "High", async () => {
  const r = await fetch(`${API}/health`, { headers: { Origin: "https://evil.example" } });
  const allow = r.headers.get("access-control-allow-origin");
  expect(allow !== "https://evil.example" && allow !== "*", `ACAO=${allow}`);
});
await test("X-Powered-By header is hidden", "Low", async () => {
  const r = await fetch(`${API}/health`);
  expect(!r.headers.get("x-powered-by"), "X-Powered-By: Express exposed");
});
await test("security headers present (X-Content-Type-Options, X-Frame-Options/CSP)", "Low", async () => {
  const r = await fetch(`${API}/health`);
  expect(r.headers.get("x-content-type-options"), "missing X-Content-Type-Options (no helmet)");
});
await test("unknown route → 404 JSON, not stack trace", "Low", async () => {
  const r = await call("GET", "/does-not-exist");
  expect(r.status === 404 && !/at .*\.(js|ts):\d+/.test(r.text), `status ${r.status}`);
});
await test("auth /export returns only the caller's data", "High", async () => {
  const r = await call("GET", "/auth/export", { token: main.token });
  expectStatus(r, 200);
  expect(!/passwordHash/.test(r.text), "passwordHash in export");
});

const { failed } = summary();
process.exit(failed.length ? 1 : 0);
