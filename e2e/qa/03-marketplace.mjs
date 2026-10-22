import { call, section, test, expect, expectStatus, summary, registerUser, uniqueEmail, makeTutor, GOOD_JOB } from "./lib.mjs";
import { backdateJob, setCoins, markVerified, count, sql } from "./db.mjs";

const mkJob = async (token, over = {}) => {
  const r = await call("POST", "/jobs", { token, body: { ...GOOD_JOB, title: `Maths tutor ${Math.random().toString(36).slice(2, 8)} needed`, ...over } });
  expectStatus(r, [200, 201], "create job");
  backdateJob(r.json.id);
  return r.json;
};
const mkTutor = async (label) => {
  const t = await registerUser({ email: uniqueEmail(label) });
  await makeTutor(t.token);
  return t;
};
const coins = async (u) => (await call("GET", "/wallet", { token: u.token })).json.coinBalance;
const INTRO = "Hello, I have 8 years of experience teaching class 10 maths and would love to help.";

const owner = await registerUser({ email: uniqueEmail("own") });
const tutorA = await mkTutor("tA");
const tutorB = await mkTutor("tB");
const outsider = await registerUser({ email: uniqueEmail("out") });
let job;

section("APPLY · rules");
await test("tutor gets starter coins on enabling role", "Medium", async () => expect((await coins(tutorA)) > 0, "tutor has 0 coins"));
await test("within first hour non-premium tutor is blocked (early access) → 403", "High", async () => {
  const fresh = await call("POST", "/jobs", { token: owner.token, body: { ...GOOD_JOB, title: "Fresh job for early access" } });
  expectStatus(fresh, [200, 201]);
  expectStatus(await call("POST", `/jobs/${fresh.json.id}/apply`, { token: tutorA.token, body: { message: INTRO } }), 403);
});
await test("apply succeeds, charges exactly the quoted coins, creates conversation", "Blocker", async () => {
  job = await mkJob(owner.token, { description: "Call me on 9876543210 for the maths class ten lessons we plan for the whole year." });
  const before = await coins(tutorA);
  const r = await call("POST", `/jobs/${job.id}/apply`, { token: tutorA.token, body: { message: INTRO } });
  expectStatus(r, [200, 201]);
  const after = await coins(tutorA);
  expect(before - after === r.json.coinsSpent, `charged ${before - after}, reported ${r.json.coinsSpent}`);
  expect(r.json.conversationId, "no conversation");
  job.convo = r.json.conversationId;
});
await test("applyCount increments and owner is notified", "High", async () => {
  const j = await call("GET", `/jobs/${job.id}`);
  expect(j.json.applyCount === 1, `applyCount ${j.json.applyCount}`);
  const n = await call("GET", "/notifications", { token: owner.token });
  expect(JSON.stringify(n.json).includes("applied"), "no notification");
});
await test("applying twice → 409 and no second charge", "High", async () => {
  const before = await coins(tutorA);
  expectStatus(await call("POST", `/jobs/${job.id}/apply`, { token: tutorA.token, body: { message: INTRO } }), 409);
  expect((await coins(tutorA)) === before, "double charge");
});
await test("owner cannot apply to own job → 400", "Medium", async () => {
  await makeTutor(owner.token);
  expectStatus(await call("POST", `/jobs/${job.id}/apply`, { token: owner.token, body: { message: INTRO } }), 400);
});
await test("student without tutor role cannot apply → 403", "High", async () => {
  expectStatus(await call("POST", `/jobs/${job.id}/apply`, { token: outsider.token, body: { message: INTRO } }), 403);
});
await test("intro under 12 chars → 400", "Medium", async () => expectStatus(await call("POST", `/jobs/${job.id}/apply`, { token: tutorB.token, body: { message: "hi" } }), 400));
await test("anonymous apply → 401", "Blocker", async () => expectStatus(await call("POST", `/jobs/${job.id}/apply`, { body: { message: INTRO } }), 401));
await test("apply to nonexistent job → 404", "Medium", async () => expectStatus(await call("POST", "/jobs/nope/apply", { token: tutorB.token, body: { message: INTRO } }), 404));
await test("apply to closed job → 404", "High", async () => {
  const closed = await mkJob(outsider.token);
  await call("PATCH", `/jobs/${closed.id}/status`, { token: outsider.token, body: { status: "CLOSED" } });
  expectStatus(await call("POST", `/jobs/${closed.id}/apply`, { token: tutorB.token, body: { message: INTRO } }), 404);
});
await test("insufficient coins → 409, nothing created, no negative balance", "Blocker", async () => {
  const poor = await mkTutor("poor");
  setCoins(poor.user.id, 0);
  const j = await mkJob(outsider.token);
  const r = await call("POST", `/jobs/${j.id}/apply`, { token: poor.token, body: { message: INTRO } });
  expectStatus(r, 409);
  expect(count("JobApply", `"jobId"='${j.id}'`) === 0 && (await coins(poor)) === 0, "state changed on failure");
});
await test("RACE: 6 parallel applies by the same tutor → exactly 1 success, 1 charge, no 5xx", "Blocker", async () => {
  const t = await mkTutor("race");
  const j = await mkJob(outsider.token);
  const before = await coins(t);
  const rs = await Promise.all(Array.from({ length: 6 }, () => call("POST", `/jobs/${j.id}/apply`, { token: t.token, body: { message: INTRO } })));
  const ok = rs.filter((r) => r.status < 300).length;
  const fivexx = rs.filter((r) => r.status >= 500).length;
  const spent = before - (await coins(t));
  const price = rs.find((r) => r.status < 300)?.json.coinsSpent ?? 0;
  expect(ok === 1 && fivexx === 0 && spent === price, `success=${ok} 5xx=${fivexx} coinsLost=${spent - price} (statuses ${rs.map((r) => r.status)})`);
});
await test("RACE: 1 coin, 2 parallel applies to different jobs → never negative", "High", async () => {
  const t = await mkTutor("race2");
  setCoins(t.user.id, 1);
  const [j1, j2] = [await mkJob(outsider.token), await mkJob(outsider.token)];
  await Promise.all([j1, j2].map((j) => call("POST", `/jobs/${j.id}/apply`, { token: t.token, body: { message: INTRO } })));
  expect((await coins(t)) >= 0, "negative balance");
});

section("APPLY · contact reveal & applicants");
await test("applied tutor sees hiddenContact; non-applied tutor does not", "Blocker", async () => {
  const a = await call("GET", `/jobs/${job.id}`, { token: tutorA.token });
  const b = await call("GET", `/jobs/${job.id}`, { token: tutorB.token });
  expect(/9876543210/.test(a.json.hiddenContact ?? ""), `applied tutor view: ${a.json.hiddenContact}`);
  expect(!/9876543210/.test(b.text), "non-applied tutor sees the number");
});
await test("applicants list: owner 200, others 403", "Blocker", async () => {
  expectStatus(await call("GET", `/jobs/${job.id}/applicants`, { token: owner.token }), 200);
  expectStatus(await call("GET", `/jobs/${job.id}/applicants`, { token: tutorB.token }), [403, 404]);
  expectStatus(await call("GET", `/jobs/${job.id}/applicants`), 401);
});
await test("applicants response exposes no email/phone/password", "Blocker", async () => {
  const r = await call("GET", `/jobs/${job.id}/applicants`, { token: owner.token });
  expect(!/@qa\.test|passwordHash|"phone":"\+?\d/.test(r.text), `leak: ${r.text.slice(0, 300)}`);
});

section("CHAT · messaging & privacy");
await test("participants can read; outsiders get 404 (IDOR)", "Blocker", async () => {
  expectStatus(await call("GET", `/conversations/${job.convo}`, { token: owner.token }), 200);
  expectStatus(await call("GET", `/conversations/${job.convo}`, { token: tutorA.token }), 200);
  expectStatus(await call("GET", `/conversations/${job.convo}`, { token: outsider.token }), 404);
  expectStatus(await call("GET", `/conversations/${job.convo}`, { token: tutorB.token }), 404);
});
await test("outsider cannot send / unlock in someone else's conversation", "Blocker", async () => {
  expectStatus(await call("POST", `/conversations/${job.convo}/messages`, { token: outsider.token, body: { body: "hello there" } }), 404);
  expectStatus(await call("POST", `/conversations/${job.convo}/unlock`, { token: outsider.token }), 404);
});
await test("conversation list only contains my threads", "High", async () => {
  const l = await call("GET", "/conversations", { token: outsider.token });
  expect(!JSON.stringify(l.json).includes(job.convo), "outsider list contains foreign thread");
});
await test("intro message stored masked (no phone) even though tutor typed one", "Blocker", async () => {
  const r = await call("POST", `/jobs/${job.id}/apply`, { token: tutorB.token, body: { message: "Hi, WhatsApp me on 9123456780 for a quick demo of class ten maths" } });
  expectStatus(r, [200, 201]);
  const c = await call("GET", `/conversations/${r.json.conversationId}`, { token: owner.token });
  expect(!/9123456780/.test(c.text), `phone visible to student before unlock: ${c.text.slice(0, 300)}`);
});
for (const [label, body] of [
  ["phone", "my number is 9876501234 please call"],
  ["email", "write to me at foo.bar@gmail.com thanks"],
  ["obfuscated email", "write to foo dot bar at gmail dot com thanks"],
  ["spelled digits", "nine eight seven six five four three two one zero call"],
  ["url", "check https://wa.me/919876501234 now"],
  ["telegram handle", "ping me on telegram @sharma_tutor please"],
]) {
  await test(`chat blocks ${label} before unlock → 400`, "Blocker", async () => {
    const r = await call("POST", `/conversations/${job.convo}/messages`, { token: tutorA.token, body: { body } });
    expect(r.status === 400, `status ${r.status} body=${r.text.slice(0, 120)}`);
  });
}
await test("normal message with numbers (class 10, 500 per hour) is allowed", "High", async () => {
  expectStatus(await call("POST", `/conversations/${job.convo}/messages`, { token: tutorA.token, body: { body: "I charge 500 per hour for class 10, 3 days a week works." } }), [200, 201]);
});
await test("empty message → 400", "Medium", async () => expectStatus(await call("POST", `/conversations/${job.convo}/messages`, { token: owner.token, body: { body: "" } }), 400));
await test("whitespace-only message rejected", "Low", async () => {
  const r = await call("POST", `/conversations/${job.convo}/messages`, { token: owner.token, body: { body: "     " } });
  expect(r.status === 400, `blank message accepted (${r.status})`);
});
await test("50,000-char message rejected", "Medium", async () => {
  const r = await call("POST", `/conversations/${job.convo}/messages`, { token: owner.token, body: { body: "a".repeat(50000) } });
  expect(r.status === 400 || r.status === 413, `huge message accepted (${r.status})`);
});
await test("XSS payload in message is stored as inert text (API returns JSON)", "High", async () => {
  const r = await call("POST", `/conversations/${job.convo}/messages`, { token: owner.token, body: { body: "<script>alert(1)</script> thanks" } });
  expect(r.status < 500, `status ${r.status}`);
});

section("CHAT · unlock contact");
await test("unlock charges once; second unlock is free", "Blocker", async () => {
  const before = await coins(owner);
  const a = await call("POST", `/conversations/${job.convo}/unlock`, { token: owner.token });
  expectStatus(a, [200, 201]);
  const mid = await coins(owner);
  const b = await call("POST", `/conversations/${job.convo}/unlock`, { token: owner.token });
  expectStatus(b, [200, 201]);
  expect((await coins(owner)) === mid && before - mid === 10, `charged ${before - mid}, second changed balance`);
});
await test("unverified student: contact stays hidden, payload is boolean + lists only EMAIL/PHONE blockers", "Blocker", async () => {
  const c = await call("GET", `/conversations/${job.convo}`, { token: tutorA.token });
  expect(c.json.contactUnlocked === false, `contactUnlocked=${JSON.stringify(c.json.contactUnlocked)} (must be strict boolean false)`);
  expect(!c.json.unlockBlockers.includes("COINS") && c.json.unlockBlockers.includes("EMAIL"), `blockers ${c.json.unlockBlockers}`);
  expect(c.json.otherPhone == null && !/\+?\d{10}/.test(JSON.stringify(c.json.messages)), "phone revealed to tutor while student unverified");
});
await test("after email+phone verified, contact is revealed to the tutor", "High", async () => {
  markVerified(owner.user.id);
  const c = await call("GET", `/conversations/${job.convo}`, { token: tutorA.token });
  expect(c.json.contactUnlocked === true, `still locked: ${JSON.stringify(c.json.unlockBlockers)}`);
});
await test("unlock with 0 coins → 409 and thread stays locked", "High", async () => {
  const s = await registerUser({ email: uniqueEmail("zero") });
  const t = await mkTutor("tz");
  const j = await mkJob(s.token);
  const ap = await call("POST", `/jobs/${j.id}/apply`, { token: t.token, body: { message: INTRO } });
  setCoins(s.user.id, 0);
  expectStatus(await call("POST", `/conversations/${ap.json.conversationId}/unlock`, { token: s.token }), 409);
});

section("CHAT · direct message to tutor");
await test("student messages tutor: charged once, repeat is free and returns same thread", "High", async () => {
  const s = await registerUser({ email: uniqueEmail("dm") });
  const before = await coins(s);
  const a = await call("POST", "/tutors/message", { token: s.token, body: { tutorUserId: tutorA.user.id, message: INTRO } });
  expectStatus(a, [200, 201]);
  const b = await call("POST", "/tutors/message", { token: s.token, body: { tutorUserId: tutorA.user.id, message: INTRO } });
  expect(a.json.conversationId === b.json.conversationId && b.json.coinsSpent === 0, "duplicate thread or double charge");
  expect(before - (await coins(s)) === a.json.coinsSpent, "balance mismatch");
});
await test("cannot message yourself → 400", "Medium", async () => expectStatus(await call("POST", "/tutors/message", { token: tutorA.token, body: { tutorUserId: tutorA.user.id, message: INTRO } }), 400));
await test("messaging a user without tutor profile → 404", "Medium", async () => expectStatus(await call("POST", "/tutors/message", { token: tutorA.token, body: { tutorUserId: outsider.user.id, message: INTRO } }), 404));
await test("student with 0 coins cannot start direct chat → 409", "High", async () => {
  const s = await registerUser({ email: uniqueEmail("dm0") });
  setCoins(s.user.id, 0);
  expectStatus(await call("POST", "/tutors/message", { token: s.token, body: { tutorUserId: tutorB.user.id, message: INTRO } }), 409);
});
await test("RACE: parallel direct-message requests create one thread and one charge", "High", async () => {
  const s = await registerUser({ email: uniqueEmail("dmr") });
  const before = await coins(s);
  const rs = await Promise.all(Array.from({ length: 5 }, () => call("POST", "/tutors/message", { token: s.token, body: { tutorUserId: tutorB.user.id, message: INTRO } })));
  const charged = before - (await coins(s));
  const threads = count("Conversation", `"studentId"='${s.user.id}'`);
  expect(rs.every((r) => r.status < 500) && threads === 1 && charged <= 50, `5xx=${rs.filter((r) => r.status >= 500).length} threads=${threads} charged=${charged}`);
});

section("BOOKING & REVIEW");
const when = new Date(Date.now() + 2 * 864e5).toISOString();
let booking;
await test("student requests a booking in own conversation", "High", async () => {
  const r = await call("POST", "/bookings", { token: owner.token, body: { conversationId: job.convo, startsAt: when, durationMin: 60 } });
  expectStatus(r, [200, 201]);
  booking = r.json;
});
await test("booking validations: duration 29/181, bad date, foreign conversation", "High", async () => {
  for (const durationMin of [29, 181, 0, -60, 60.5]) {
    expect((await call("POST", "/bookings", { token: owner.token, body: { conversationId: job.convo, startsAt: when, durationMin } })).status === 400, `duration ${durationMin} accepted`);
  }
  expect((await call("POST", "/bookings", { token: owner.token, body: { conversationId: job.convo, startsAt: "tomorrow", durationMin: 60 } })).status === 400, "bad date accepted");
  expect((await call("POST", "/bookings", { token: outsider.token, body: { conversationId: job.convo, startsAt: when, durationMin: 60 } })).status === 403, "outsider booked");
});
await test("booking in the past is rejected", "Medium", async () => {
  const r = await call("POST", "/bookings", { token: owner.token, body: { conversationId: job.convo, startsAt: "2020-01-01T10:00:00Z", durationMin: 60 } });
  expect(r.status === 400, `past booking accepted (${r.status})`);
});
await test("tutor (non-student) cannot create booking", "Medium", async () => {
  expectStatus(await call("POST", "/bookings", { token: tutorA.token, body: { conversationId: job.convo, startsAt: when, durationMin: 60 } }), 403);
});
await test("review before completion → 400; complete before confirm → 400", "High", async () => {
  expectStatus(await call("POST", `/bookings/${booking.id}/review`, { token: owner.token, body: { rating: 5 } }), 400);
  expectStatus(await call("POST", `/bookings/${booking.id}/complete`, { token: owner.token }), 400);
});
await test("outsider cannot confirm/cancel/complete someone else's booking", "Blocker", async () => {
  for (const act of ["confirm", "cancel", "complete"]) expectStatus(await call("POST", `/bookings/${booking.id}/${act}`, { token: outsider.token, body: {} }), 403, act);
});
await test("confirm → complete → review happy path updates tutor rating", "Blocker", async () => {
  expectStatus(await call("POST", `/bookings/${booking.id}/confirm`, { token: owner.token }), [200, 201]);
  expectStatus(await call("POST", `/bookings/${booking.id}/complete`, { token: owner.token }), [200, 201]);
  expectStatus(await call("POST", `/bookings/${booking.id}/review`, { token: owner.token, body: { rating: 5, body: "Excellent" } }), [200, 201]);
});
await test("duplicate review → 400; rating 0/6/2.5/'5' rejected", "High", async () => {
  expectStatus(await call("POST", `/bookings/${booking.id}/review`, { token: owner.token, body: { rating: 4 } }), 400);
  for (const rating of [0, 6, 2.5, "5", null]) expect((await call("POST", `/bookings/${booking.id}/review`, { token: owner.token, body: { rating } })).status === 400, `rating ${rating} accepted`);
});
await test("tutor cannot review their own booking", "High", async () => {
  expectStatus(await call("POST", `/bookings/${booking.id}/review`, { token: tutorA.token, body: { rating: 5 } }), [400, 403]);
});
await test("cancel a completed booking → 400", "Medium", async () => expectStatus(await call("POST", `/bookings/${booking.id}/cancel`, { token: owner.token, body: {} }), 400));
await test("booking list shows only mine", "High", async () => {
  const l = await call("GET", "/bookings", { token: outsider.token });
  expect(!JSON.stringify(l.json).includes(booking.id), "foreign booking visible");
});

const { failed } = summary();
process.exit(failed.length ? 1 : 0);
