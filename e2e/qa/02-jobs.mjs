import { call as _unused, section, test, expect, expectStatus, summary, registerUser, uniqueEmail, makeTutor, GOOD_JOB } from "./lib.mjs";

const job = (over = {}) => ({ ...GOOD_JOB, title: `Maths tutor ${Math.random().toString(36).slice(2, 8)} needed`, ...over });
let student = await registerUser({ email: uniqueEmail("jstu") });
const firstStudent = student;
let createdByCurrent = 0;
const rawCall = _unused;
async function call(method, path, opts = {}) {
  if (method === "POST" && path === "/jobs" && opts.token === student.token) {
    if (createdByCurrent >= 4) {
      student = await registerUser({ email: uniqueEmail("jstu") });
      createdByCurrent = 0;
      opts = { ...opts, token: student.token };
    }
    createdByCurrent += 1;
  }
  return rawCall(method, path, opts);
}
const other = await registerUser({ email: uniqueEmail("jother") });
let created;

section("JOBS · create (positive)");
await test("valid job is created with all fields persisted", "Blocker", async () => {
  const r = await call("POST", "/jobs", { token: student.token, body: job() });
  expectStatus(r, [200, 201]);
  created = r.json;
  expect(created.id, "no id");
  expect(created.city === GOOD_JOB.city && created.currency === "INR" && created.budgetType === "HOURLY", "fields lost");
  expect(created.languages?.join() === "English,Hindi", `languages ${JSON.stringify(created.languages)}`);
});
for (const type of ["TUTORING", "ASSIGNMENT", "PROJECT", "EXAM_PREP", "HOMEWORK", "GROUP_CLASS"]) {
  await test(`job type ${type} accepted`, "High", async () => expectStatus(await call("POST", "/jobs", { token: student.token, body: job({ type }) }), [200, 201]));
}
await test("multiple subjects are stored and the job is filterable by each", "High", async () => {
  const r = await call("POST", "/jobs", { token: other.token, body: job({ subject: "Physics, Chemistry" }) });
  expectStatus(r, [200, 201]);
  const byChem = await call("GET", "/jobs?subject=Chemistry");
  expect(byChem.json.some((j) => j.id === r.json.id), "multi-subject job missing in Chemistry filter");
});
await test("FREE budget type with no amounts is accepted", "High", async () => {
  const r = await call("POST", "/jobs", { token: other.token, body: job({ budgetType: "FREE", budgetMin: undefined, budgetMax: undefined }) });
  expectStatus(r, [200, 201]);
});
await test("job appears in /jobs, /jobs/mine and /jobs/:id", "Blocker", async () => {
  expect((await call("GET", "/jobs")).json.some((j) => j.id === created.id), "not in /jobs");
  expect((await call("GET", "/jobs/mine", { token: firstStudent.token })).json.some((j) => j.id === created.id), "not in mine");
  expectStatus(await call("GET", `/jobs/${created.id}`), 200);
});

section("JOBS · new validation rules (this release)");
const bad = (label, over, severity = "High") =>
  test(`rejects: ${label}`, severity, async () => {
    const r = await call("POST", "/jobs", { token: student.token, body: job(over) });
    expect(r.status >= 400 && r.status < 500, `accepted/5xx (status ${r.status}) ${r.text.slice(0, 160)}`);
  });
await bad("missing city", { city: undefined });
await bad("empty city", { city: "" });
await bad("1-char city", { city: "A" });
await bad("missing languages", { languages: undefined });
await bad("empty languages array", { languages: [] });
await bad("missing currency", { currency: undefined });
await bad("unknown currency XYZ", { currency: "XYZ" });
await bad("missing budgetType", { budgetType: undefined });
await bad("unknown budgetType", { budgetType: "WEEKLY_RAINBOW" });
await bad("description 9 words", { description: "I need a maths tutor for my exams now" });
await bad("description 9 words padded with spaces", { description: "one   two   three four five six seven eight nine      " });
await bad("description only punctuation", { description: "... ... ... ... ... ... ... ... ... ... ... ..." }, "Medium");
await bad("title shorter than 8", { title: "short" });
await bad("paid budget without amounts", { budgetMin: undefined, budgetMax: undefined });
await bad("paid budget with only min", { budgetMax: undefined });
await bad("budgetMin > budgetMax", { budgetMin: 90000, budgetMax: 1000 });
await bad("negative budget", { budgetMin: -5, budgetMax: 100 });
await bad("fractional budget (not integer)", { budgetMin: 10.5, budgetMax: 100 });
await bad("digits-only skill '00000111' (screenshot bug)", { subject: "00000111" });
await bad("skill '12345'", { subject: "12345" });
await bad("skill single char", { subject: "a" });
await bad("skill only symbols '@@##'", { subject: "@@##" });
await bad("skill with profanity", { subject: "fuck" });
await bad("skill with leet profanity 'Sh1t'", { subject: "Sh1t" });
await bad("skill containing a phone number", { subject: "Maths 9876543210" });
await bad("skill containing email", { subject: "math a@b.com" }, "High");
await bad("one bad skill among good ones", { subject: "Maths, 0000, Physics" });
await bad("skill > 40 chars", { subject: "x".repeat(41) });
await bad("profane description", { description: "this tutor must be a complete bitch otherwise i will not pay anything at all okay" });
await bad("unknown job type", { type: "SORCERY" });
await bad("empty modes", { modes: [] });
await bad("invalid mode", { modes: ["TELEPATHY"] });
await bad("unknown extra field (mass assignment) status=FILLED", { status: "FILLED" });
await bad("extra field studentId (spoof owner)", { studentId: other.user.id });
await bad("extra field applyCount", { applyCount: 99 });
await bad("invalid visibility", { visibility: "SECRET" });

await test("valid skills that look unusual are still accepted: 'C++', 'C#', 'Class 10 Maths', 'A-Level Physics'", "High", async () => {
  const r = await call("POST", "/jobs", { token: student.token, body: job({ subject: "C++, C#, Class 10 Maths, A-Level Physics" }) });
  expectStatus(r, [200, 201]);
});
await test("unicode skill (Hindi) accepted", "Medium", async () => expectStatus(await call("POST", "/jobs", { token: student.token, body: job({ subject: "गणित" }) }), [200, 201]));
await test("description of exactly 10 words accepted", "High", async () => {
  expectStatus(await call("POST", "/jobs", { token: student.token, body: job({ description: "need maths tutor for class ten board exam preparation please" }) }), [200, 201]);
});
await test("duplicate title for same student while OPEN → 409", "Medium", async () => {
  const body = job();
  expectStatus(await call("POST", "/jobs", { token: student.token, body }), [200, 201]);
  expectStatus(await call("POST", "/jobs", { token: student.token, body }), 409);
});

section("JOBS · contact-leak protection (masking)");
const leaks = [
  ["phone digits", "call me on 9876543210 any time for the maths class ten lessons we plan for the year"],
  ["phone with country code and spaces", "reach me at +91 98765 43210 for the maths class ten lessons we plan for the year"],
  ["email", "mail me at rahul.sharma@gmail.com for the maths class ten lessons we plan for the whole year"],
  ["obfuscated email 'at gmail dot com'", "mail rahul at gmail dot com for the maths class ten lessons we plan for the whole year"],
  ["url", "visit https://my-site.example.com/contact for the maths class ten lessons we plan for the year"],
  ["www url", "visit www.mysite.com for the maths class ten lessons we plan for the whole year, thanks"],
  ["whatsapp mention", "ping me on whatsapp for the maths class ten lessons we plan for the whole year ok"],
  ["spelled out number", "nine eight seven six five four three two one zero is my number for the maths class ten lessons"],
];
for (const [label, description] of leaks) {
  await test(`contact (${label}) is masked in public view`, "Blocker", async () => {
    const r = await call("POST", "/jobs", { token: student.token, body: job({ description }) });
    expectStatus(r, [200, 201]);
    const pub = await call("GET", `/jobs/${r.json.id}`);
    expect(!/9876543210|98765 43210|rahul\.sharma|gmail dot com|my-site|mysite\.com|whatsapp|nine eight seven/i.test(pub.text), `leaked publicly: ${pub.json?.description}`);
    const list = await call("GET", "/jobs");
    const row = list.json.find((j) => j.id === r.json.id);
    expect(!row || !/9876543210|98765 43210|rahul\.sharma|gmail dot com|my-site|mysite\.com|whatsapp/i.test(JSON.stringify(row)), "leaked in list");
  });
}
await test("contact in the TITLE is masked too", "Blocker", async () => {
  const r = await call("POST", "/jobs", { token: student.token, body: job({ title: "Call 9876501234 maths tutor" }) });
  expectStatus(r, [200, 201]);
  expect(!/9876501234/.test((await call("GET", "/jobs")).text), "phone in title visible in public list");
});
await test("contact is NOT visible to a logged-in tutor who has not applied", "Blocker", async () => {
  const r = await call("POST", "/jobs", { token: student.token, body: job({ description: leaks[0][1] }) });
  const t = await registerUser({ email: uniqueEmail("snoop") });
  await makeTutor(t.token);
  const view = await call("GET", `/jobs/${r.json.id}`, { token: t.token });
  expect(!view.json.hiddenContact && !/9876543210/.test(view.text), `snooping tutor saw: ${view.json?.hiddenContact}`);
});
await test("contact is visible to the owner", "High", async () => {
  const r = await call("POST", "/jobs", { token: student.token, body: job({ description: leaks[0][1] }) });
  const own = await call("GET", `/jobs/${r.json.id}`, { token: student.token });
  expect(/9876543210/.test(own.json.hiddenContact ?? ""), `owner view: ${own.json.hiddenContact}`);
});
await test("anonymous request never gets hiddenContact", "Blocker", async () => {
  const r = await call("POST", "/jobs", { token: student.token, body: job({ description: leaks[1][1] }) });
  const anon = await call("GET", `/jobs/${r.json.id}`);
  expect(!anon.json.hiddenContact, "anonymous got hiddenContact");
});
await test("editing a job with a phone number does not leak it either", "Blocker", async () => {
  const r = await call("POST", "/jobs", { token: student.token, body: job() });
  const upd = await call("PATCH", `/jobs/${r.json.id}`, { token: student.token, body: job({ title: r.json.title, description: leaks[0][1] }) });
  expectStatus(upd, [200, 201]);
  expect(!/9876543210/.test((await call("GET", `/jobs/${r.json.id}`)).text), "leak via PATCH");
});
await test("normal numbers (class 10, budget 500, 3 days) are NOT treated as phone numbers", "High", async () => {
  const r = await call("POST", "/jobs", { token: student.token, body: job({ description: "need class 10 maths tutor, budget around 500 to 800 per hour, 3 days a week, 2026 board exam" }) });
  expectStatus(r, [200, 201]);
  const v = await call("GET", `/jobs/${r.json.id}`);
  expect(!/hidden number/.test(v.json.description), `false positive: ${v.json.description}`);
});

section("JOBS · update / status / ownership");
await test("owner can PATCH title/description", "High", async () => {
  const r = await call("PATCH", `/jobs/${created.id}`, { token: firstStudent.token, body: job({ title: created.title }) });
  expectStatus(r, [200, 201]);
});
await test("another user cannot PATCH my job → 403", "Blocker", async () => {
  expectStatus(await call("PATCH", `/jobs/${created.id}`, { token: other.token, body: job({ title: created.title }) }), 403);
});
await test("anonymous cannot PATCH → 401", "Blocker", async () => expectStatus(await call("PATCH", `/jobs/${created.id}`, { body: job() }), 401));
await test("another user cannot change status → 403", "Blocker", async () => {
  expectStatus(await call("PATCH", `/jobs/${created.id}/status`, { token: other.token, body: { status: "CLOSED" } }), 403);
});
await test("invalid status value → 400", "Medium", async () => {
  expectStatus(await call("PATCH", `/jobs/${created.id}/status`, { token: firstStudent.token, body: { status: "EXPLODED" } }), 400);
});
await test("PATCH nonexistent job → 404", "Medium", async () => expectStatus(await call("PATCH", "/jobs/nonexistent/status", { token: student.token, body: { status: "CLOSED" } }), 404));
await test("GET nonexistent job → 404", "Medium", async () => expectStatus(await call("GET", "/jobs/nonexistent-id"), 404));
await test("PATCH that violates new rules (short description) is rejected", "High", async () => {
  const r = await call("PATCH", `/jobs/${created.id}`, { token: firstStudent.token, body: job({ title: created.title, description: "too short now" }) });
  expect(r.status >= 400 && r.status < 500, `edit bypassed validation: ${r.status}`);
});
await test("closed job disappears from public list", "High", async () => {
  const r = await call("POST", "/jobs", { token: student.token, body: job() });
  await call("PATCH", `/jobs/${r.json.id}/status`, { token: student.token, body: { status: "CLOSED" } });
  expect(!(await call("GET", "/jobs")).json.some((j) => j.id === r.json.id), "closed job still listed");
});
await test("PRIVATE job is hidden from public list and direct view for others", "Blocker", async () => {
  const r = await call("POST", "/jobs", { token: student.token, body: job({ visibility: "PRIVATE" }) });
  expect(!(await call("GET", "/jobs")).json.some((j) => j.id === r.json.id), "private job in public list");
  expectStatus(await call("GET", `/jobs/${r.json.id}`, { token: other.token }), 404);
  expectStatus(await call("GET", `/jobs/${r.json.id}`), 404);
  expectStatus(await call("GET", `/jobs/${r.json.id}`, { token: student.token }), 200);
});
await test("anonymous cannot create a job → 401", "Blocker", async () => expectStatus(await call("POST", "/jobs", { body: job() }), 401));
await test("daily limit: 6th job in 24h → 409", "Medium", async () => {
  const u = await registerUser({ email: uniqueEmail("limit") });
  const codes = [];
  for (let i = 0; i < 7; i += 1) codes.push((await call("POST", "/jobs", { token: u.token, body: job() })).status);
  expect(codes.slice(0, 5).every((c) => c === 201 || c === 200) && codes.slice(5).every((c) => c === 409), `statuses ${codes}`);
});

section("JOBS · listing, filtering, search");
await test("filter by city/mode/level/type/q all return arrays without 5xx", "High", async () => {
  for (const qs of ["city=Mumbai", "mode=ONLINE", "mode=ALL", "level=High%20school", "type=TUTORING", "type=NOPE", "q=maths", "subject=Mathematics", "matched=1"]) {
    const r = await call("GET", `/jobs?${qs}`);
    expect(r.status < 500 && Array.isArray(r.json ?? []), `${qs} → ${r.status} ${r.text.slice(0, 120)}`);
  }
});
await test("filter by invalid type returns 400/empty, not 500", "Medium", async () => {
  const r = await call("GET", "/jobs?type=NOPE");
  expect(r.status < 500, `5xx ${r.status}`);
});
await test("search with SQLi / regex / unicode / 5k chars does not break", "High", async () => {
  for (const q of ["' OR 1=1 --", ".*(", "\\", "%00", "😀", "a".repeat(5000)]) {
    const r = await call("GET", `/jobs?q=${encodeURIComponent(q)}`);
    expect(r.status < 500, `q=${q.slice(0, 20)} → ${r.status}`);
  }
});
await test("list never returns more than 50 rows", "Medium", async () => expect((await call("GET", "/jobs")).json.length <= 50, "unbounded list"));

const { failed } = summary();
process.exit(failed.length ? 1 : 0);
