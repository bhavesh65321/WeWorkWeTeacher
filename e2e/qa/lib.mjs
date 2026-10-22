export const API = process.env.QA_API ?? "http://localhost:4000/api";
export const WEB = process.env.QA_WEB ?? "http://localhost:3000";

export async function call(method, path, { token, body, headers = {}, raw = false } = {}) {
  const started = performance.now();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body !== undefined && !raw ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { status: res.status, json, text, ms: performance.now() - started, headers: res.headers };
}

const results = [];
let currentSection = "";

export function section(name) {
  currentSection = name;
  console.log(`\n=== ${name} ===`);
}

export async function test(name, severity, fn) {
  try {
    await fn();
    results.push({ section: currentSection, name, severity, ok: true });
    console.log(`  PASS  ${name}`);
  } catch (err) {
    results.push({ section: currentSection, name, severity, ok: false, detail: String(err.message ?? err) });
    console.log(`  FAIL  [${severity}] ${name}\n        -> ${String(err.message ?? err).slice(0, 400)}`);
  }
}

export function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}

export function expectStatus(res, allowed, label = "") {
  const list = Array.isArray(allowed) ? allowed : [allowed];
  expect(list.includes(res.status), `${label} expected ${list.join("/")} got ${res.status}: ${res.text.slice(0, 200)}`);
}

export function summary() {
  const failed = results.filter((r) => !r.ok);
  console.log(`\n--- ${results.length - failed.length}/${results.length} passed, ${failed.length} failed ---`);
  for (const f of failed) console.log(`  [${f.severity}] ${f.section} :: ${f.name}\n      ${f.detail}`);
  return { results, failed };
}

let counter = 0;
export function uniqueEmail(prefix = "qa") {
  counter += 1;
  return `${prefix}.${Date.now()}.${counter}@qa.test`;
}

export async function registerUser({ name = "QA User", dob = "1995-05-05", password = "Passw0rd!123", email } = {}) {
  const res = await call("POST", "/auth/register", {
    body: { email: email ?? uniqueEmail(), password, name, dateOfBirth: dob },
  });
  expectStatus(res, [200, 201], "register");
  return { token: res.json.token, user: res.json.user, email: email, password };
}

export async function login(email, password = "password123") {
  const res = await call("POST", "/auth/login", { body: { email, password } });
  expectStatus(res, [200, 201], `login ${email}`);
  return res.json.token;
}

export async function makeTutor(token) {
  const res = await call("POST", "/auth/enable-tutor", { token });
  expectStatus(res, [200, 201], "enable-tutor");
  return res;
}

export const GOOD_JOB = {
  type: "TUTORING",
  title: "Need a class 10 maths tutor",
  description: "I need an experienced maths tutor for class ten board exam preparation, three days every week please.",
  subject: "Mathematics",
  level: "High school",
  modes: ["ONLINE"],
  visibility: "PUBLIC",
  city: "Andheri, Mumbai, Maharashtra",
  country: "India",
  languages: ["English", "Hindi"],
  currency: "INR",
  budgetType: "HOURLY",
  budgetMin: 30000,
  budgetMax: 80000,
  whenNeeded: "ASAP",
  frequency: "WEEKLY",
  genderPref: "ANY",
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
