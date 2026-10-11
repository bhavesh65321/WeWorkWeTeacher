# WTWS V1 — Developer User Stories (Detailed)

**Product:** WeTeacherWeStudent (improve existing app — not a greenfield rewrite)  
**Stack:** `apps/api` NestJS + Prisma · `apps/web` Next.js · `packages/shared`  
**Market:** India only · **Fee:** 12% platform take (do not change)  
**Goal:** Onboard more users; revenue secondary  
**Related:** [PRD-V1.md](./PRD-V1.md)

---

## How to use this doc

1. Pick a story by **ID** (e.g. `US-4.1`).
2. Implement until **every Acceptance Criteria checkbox** can be marked done.
3. Follow **UI / API / Edge cases** sections — they are requirements, not suggestions.
4. Do **not** build items in **Out of scope**.
5. Link the story ID in the PR title/description.
6. Tag meaning: **EXISTS** = verify/polish · **ENHANCE** = extend · **NEW** = build · **P0/P1** = priority · **S/M/L** = effort.

### Global rules (apply to every story)
- No phone, WhatsApp, email, or external chat links before contact unlock.
- One account; role switch Student ↔ Tutor; dashboards must not mix roles.
- Default currency for new India flows: **INR**.
- Parents use the **Student** role (no separate Parent role).
- No video classroom in V1.

---

# Epic 0 — India foundations

## US-0.1 — India defaults (INR, languages, country) · P0 · ENHANCE · S

**As a** student or tutor in India  
**I want** the product to default to Indian currency and familiar language options  
**So that** I don’t see USD or foreign-first settings on first use  

### Background
Job form currently defaults `currency` to `USD`. For India V1 this must be INR. Language list exists in `packages/shared` — reorder so Indian languages appear first.

### Acceptance criteria
- [ ] **AC1** Opening `/jobs/new` as a new student shows **Currency = INR** selected by default (not USD).
- [ ] **AC2** Opening tutor profile edit for a new tutor shows **Currency = INR** for rate by default when unset.
- [ ] **AC3** Language multi-select lists **English, Hindi** first, then other Indian languages (Bengali, Tamil, Telugu, Urdu, Marathi if present / add Marathi if missing), then remaining languages.
- [ ] **AC4** Country field on job/profile prefills **India** when empty and user has no country saved.
- [ ] **AC5** Existing users who already saved USD/EUR are **not** forcibly migrated; only defaults for empty/new forms change.
- [ ] **AC6** Seed demo data uses INR for India-facing tutors/jobs where practical.

### UI notes
- Currency dropdown label shows `INR (₹)` if easy; otherwise `INR` is enough.
- No separate “region picker” screen required.

### API / code touchpoints
- `apps/web/components/job-requirement-form.tsx` — change default `currency: "INR"`.
- Tutor edit page / DTO defaults.
- `packages/shared/src/constants.ts` — reorder `LANGUAGE_OPTIONS` (or add `LANGUAGE_OPTIONS_INDIA_FIRST` used by forms).

### Edge cases
- User explicitly selects USD → respect selection; do not reset on step change.
- Edit existing job that was USD → keep USD unless user changes it.

### Out of scope
- Multi-country geo-IP detection.
- Changing Stripe settlement currency beyond what already exists.

### Test
1. Incognito → register → post job → currency is INR.  
2. Change to USD → submit → saved as USD.  
3. Language picker: English/Hindi appear in first two rows.

---

## US-0.2 — Funnel analytics events · P1 · NEW · M

**As a** product manager  
**I want** core funnel events emitted from API/web  
**So that** we can measure onboarding without guessing  

### Acceptance criteria
- [ ] **AC1** Shared helper `track(eventName, props)` exists (web and/or API). V1 may log to console + optional stub; must be one call site pattern.
- [ ] **AC2** Events fire exactly once per successful action:

| Event | When |
|-------|------|
| `signup_completed` | Register or Google signup succeeds |
| `otp_verified` | Email or phone OTP verify succeeds |
| `tutor_published` | Tutor profile becomes `isPublished=true` |
| `job_posted` | Job create succeeds |
| `match_notified` | After match notifications created (include `jobId`, `matchCount`) |
| `job_applied` | Tutor apply succeeds |
| `chat_started` | First message in a new conversation OR apply creates conversation |
| `escrow_paid` | Escrow funding succeeds |
| `contact_unlocked` | Contact unlock becomes true for a conversation/booking |
| `report_submitted` | Flag/report created |
| `user_blocked` | Admin blocks a user |

- [ ] **AC3** Payload always includes: `event`, `timestamp` (ISO), `userId` (or `anonymous`), `activeRole` when known.
- [ ] **AC4** Short `docs/ANALYTICS-V1.md` lists events above.

### Out of scope
- Full Mixpanel/Amplitude billing integration (wire later behind same helper).

---

# Epic 1 — Auth, verification, role switch

## US-1.1 — One login + role switch · P0 · EXISTS · S

**As a** user  
**I want** a single login and the ability to switch between Student and Tutor  
**So that** I can post jobs and apply to jobs without two accounts  

### Acceptance criteria
- [ ] **AC1** User registers once (email/password or Google) and receives a session.
- [ ] **AC2** Header shows **Role switch** control when logged in.
- [ ] **AC3** Switching to Tutor updates `activeRole` via API and refreshes nav to tutor items only.
- [ ] **AC4** Switching to Student shows student items only (no tutor “Apply with coins” chrome on student dashboard).
- [ ] **AC5** User may have both `STUDENT` and `TUTOR` in `roles[]`; switching does not delete the other role.
- [ ] **AC6** After switch, `/dashboard` content matches active role.

### Edge cases
- User with only STUDENT who opens “Join as tutor” must gain TUTOR role then switch.
- Admin role remains available only for admin users (unchanged).

### Regression checklist
- [ ] Post job as student → switch to tutor → jobs feed loads → switch back → my posts still visible.

---

## US-1.2 — Email + phone OTP verification · P0 · EXISTS · S

**As a** user  
**I want** to verify my email and phone with OTP  
**So that** I can unlock contact after payment and appear trustworthy  

### Acceptance criteria
- [ ] **AC1** `/verify` supports email OTP and phone OTP flows already in product.
- [ ] **AC2** Settings or verify page shows status: Email verified Yes/No · Phone verified Yes/No.
- [ ] **AC3** `GET /auth/me` (or equivalent) exposes `emailVerified` and phone presence/verification consistent with backend.
- [ ] **AC4** Unverified phone: user can still browse/post/apply, but **cannot** unlock WhatsApp/phone display (see US-5.2).

### UI notes
- Use plain labels: “Email verified” / “Add & verify phone” — no “KYC” wording.

### Edge cases
- Google signup with verified email → email treated as verified without extra OTP.
- Invalid OTP → clear error; no session corruption.

---

## US-1.3 — Google sign-in · P0 · EXISTS · S

**As a** user  
**I want** to continue with Google  
**So that** I can sign up quickly  

### Acceptance criteria
- [ ] **AC1** `/auth/google` + callback works when `GOOGLE_CLIENT_ID/SECRET` set.
- [ ] **AC2** If Google email is not verified, login is rejected with clear error.
- [ ] **AC3** Returning Google user gets same account (no duplicate by email).

### Out of scope
- Apple / Truecaller login.

---

## US-1.4 — Blocked users cannot use the product · P0 · NEW · M

**As an** admin  
**I want** blocked users rejected on login and authenticated APIs  
**So that** scammers stop operating after a manual block  

### Acceptance criteria
- [ ] **AC1** Add `blockedAt DateTime?` (and optional `blockReason String?`) on `User` via Prisma migration.
- [ ] **AC2** Email/password login for blocked user returns **401/403** with message: `Your account has been blocked. Contact support.`
- [ ] **AC3** Google login for blocked user returns the same message.
- [ ] **AC4** Existing JWT for a user blocked after issue is rejected on next API call (check `blockedAt` in auth guard).
- [ ] **AC5** Blocked user cannot: create job, apply, send message, buy coins (all fail with same account-blocked error).
- [ ] **AC6** Blocking is only via admin action (US-7.2); no self-serve unblock in V1.

### API
- Guard: after resolving user from JWT, if `user.blockedAt != null` → throw Forbidden.

### Edge cases
- Admin cannot block themselves (return 400).
- Blocking does not delete data (soft restriction only).

### Test
1. Admin blocks tutor X.  
2. X’s session fails on next API.  
3. X login shows blocked message.  
4. X’s open jobs: see US-7.2 for close behavior.

---

# Epic 2 — Profiles

## US-2.1 — Tutor must-have checklist before publish · P0 · ENHANCE · M

**As a** tutor  
**I want** a clear list of required profile fields and to be unpublished until they are complete  
**So that** students only see usable profiles  

### Must-have (all required to publish)
| Field | Rule |
|-------|------|
| Photo | `photoUrl` present |
| Display name | from user name, non-empty |
| City | non-empty string |
| Modes | ≥ 1 of ONLINE / HOME / TRAVEL / ASSIGNMENT |
| Skills/subjects | ≥ 1 skill name **or** ≥ 1 subject |
| Rate | `hourlyRateMinor` (or rate field used today) > 0 **unless** rate type FREE |
| Currency | set (default INR) |
| Languages | ≥ 1 |
| Bio | trimmed length ≥ 20 |

### Nice-to-have (optional, do not block publish)
Intro video, courses list, gender, works-as, years teaching, education, teaching approach, free trial minutes.

### Acceptance criteria
- [ ] **AC1** API rejects `isPublished: true` (or publish action) if any must-have missing; error lists missing field keys.
- [ ] **AC2** Tutor edit UI shows checklist with green/red per must-have and count e.g. `6/9 complete`.
- [ ] **AC3** Nice-to-have fields are in a collapsed section titled **Add more (optional)**.
- [ ] **AC4** Unpublished tutors **do not** appear in `/tutors` search.
- [ ] **AC5** Student dashboard / tutor dashboard shows **Complete profile** CTA while incomplete.
- [ ] **AC6** Saving drafts of partial profile is allowed with `isPublished=false`.

### Edge cases
- User removes city after publish → auto-unpublish OR block save until fixed (prefer: save allowed but `isPublished` forced false with toast).

### Out of scope
- Intro video upload pipeline (field can exist as URL text only if already there; not required).

---

## US-2.2 — Student profile basics · P0 · EXISTS · S

**As a** student/parent  
**I want** my name, city, and phone on my account  
**So that** tutors can contact me after I pay  

### Acceptance criteria
- [ ] **AC1** Settings allows update of name, city, phone.
- [ ] **AC2** If phone missing, student dashboard shows action card linking to settings/verify.
- [ ] **AC3** Phone format validated (existing `normalizePhone` rules).

---

## US-2.3 — Verified badges on tutor surfaces · P1 · NEW · S

**As a** student  
**I want** to see if a tutor verified email/phone  
**So that** I feel safer messaging them  

### Acceptance criteria
- [ ] **AC1** Tutor card and tutor profile show chips: `Email verified` and/or `Phone verified` when true.
- [ ] **AC2** If not verified, chip is hidden (do not show “Not verified” in red — avoid shaming; optional muted “Verification pending” only on own edit view).
- [ ] **AC3** Do **not** show “Government ID verified” or similar.

### API
- Include booleans on tutor public DTO from related user flags.

---

# Epic 3 — Student jobs & discovery

## US-3.1 — Post requirement (free, all modes) · P0 · EXISTS · S

**As a** student  
**I want** to post a tutoring or assignment requirement for free  
**So that** tutors can apply  

### Acceptance criteria
- [ ] **AC1** Authenticated student can submit job via 3-step form without paying coins.
- [ ] **AC2** Supported modes: ONLINE, HOME, TRAVEL, ASSIGNMENT (multi-select as today).
- [ ] **AC3** Job types: TUTORING, ASSIGNMENT.
- [ ] **AC4** Description containing phone/email/URL/WhatsApp is rejected with existing leak message.
- [ ] **AC5** `MAX_JOBS_PER_DAY` enforced; over limit returns clear error.
- [ ] **AC6** On success, redirect to job detail or my posts; job status OPEN.

### Edge cases
- Student cannot post while blocked (US-1.4).
- Title auto-built from subject + mode + city when title short (existing behavior kept).

---

## US-3.2 — Fast mobile post flow · P0 · ENHANCE · M

**As a** student on a phone  
**I want** to finish posting in about one minute  
**So that** I don’t abandon the form  

### Acceptance criteria
- [ ] **AC1** Step 1 focuses on: type, subject, level, modes, short description (required).
- [ ] **AC2** Step 2: city, when needed, frequency, gender pref (gender optional default ANY).
- [ ] **AC3** Step 3: budget fields optional enough to skip with “I’m flexible” / empty max — product must allow submit without both budget min/max if budget type FREE or user leaves blank (if today requires budget, relax validation for V1 empty budget).
- [ ] **AC4** Primary button sticky or always visible: Continue / Post requirement.
- [ ] **AC5** Validation errors show inline on the active step (not only top alert).
- [ ] **AC6** Works usable at 375px width without horizontal scroll of the form.

### Out of scope
- Native mobile app.

---

## US-3.3 — My posts management · P0 · EXISTS · S

**As a** student  
**I want** to view, edit, and close my requirements  
**So that** I control what tutors see  

### Acceptance criteria
- [ ] **AC1** `/jobs/mine` lists only the current user’s jobs, newest first.
- [ ] **AC2** User can edit fields allowed today and save.
- [ ] **AC3** User can set status OPEN → CLOSED or FILLED.
- [ ] **AC4** CLOSED/FILLED jobs no longer accept new applies (API returns error).

---

## US-3.4 — Find tutors by mode · P0 · EXISTS · S

**As a** student  
**I want** to browse All / Online / Home / Assignment tutors  
**So that** I can pick someone and message them  

### Acceptance criteria
- [ ] **AC1** `/tutors` tabs filter by mode correctly.
- [ ] **AC2** Only `isPublished=true` tutors listed.
- [ ] **AC3** Card shows: name, photo (or placeholder), headline/subjects, city, rate, modes.
- [ ] **AC4** Empty state: “No tutors yet — post a requirement instead” + link to `/jobs/new`.

---

## US-3.5 — Message tutor (costs coins) · P0 · EXISTS · S

**As a** student  
**I want** to start a chat from a tutor profile by spending coins  
**So that** I can talk without posting a job  

### Acceptance criteria
- [ ] **AC1** Before confirm, UI shows cost = `STUDENT_MESSAGE_COST` (**50** coins per `marketplace-rules.ts`).
- [ ] **AC2** If balance < 50, disable confirm and link to `/wallet`.
- [ ] **AC3** On success: coins debited, conversation created, redirect to inbox/conversation.
- [ ] **AC4** Phone/WhatsApp remain locked until US-5.2 conditions met.
- [ ] **AC5** Cannot message self.

### Edge cases
- Double-click submit → only one debit (idempotent or disable button while loading).

---

# Epic 4 — Matching & notifications (critical)

## US-4.1 — Fuzzy match: skills + language + mode · P0 · ENHANCE · L

**As a** tutor  
**I want** to be matched to jobs when my skills overlap enough and language/mode fit  
**So that** I get relevant leads without exact subject-only matching  

### Problem today
`notifyMatchingTutors` matches only exact `job.subject` ∈ tutor subjects. Budget is unused (keep unused). Must upgrade to fuzzy skills + language + mode.

### Matching algorithm (required)
```
Normalize each skill/subject string:
  - lowercase, trim
  - map aliases: maths↔mathematics↔math, eng↔english, etc. (maintain small alias map in shared/api)

skillOverlap = |A ∩ B| / |A ∪ B|   // Jaccard on normalized skill sets
  A = tutor skills∪subjects
  B = job subject + any job skill tags if present (if job only has subject, B = {subject})

match = skillOverlap >= 0.35
     AND languagesIntersect(tutor.languages, job.languages or student preference if stored; if job has no language, treat as match-all for language)
     AND modesIntersect(tutor.modes, job.modes)
     AND tutor.isPublished
     AND tutor.notifyMatching === true
     AND tutor.userId !== job.studentId
```
**Do not filter on budget.**

### Acceptance criteria
- [ ] **AC1** Overlap `0.34` → not matched; `0.35` → matched (unit tests).
- [ ] **AC2** Shared language required when job specifies language(s); if job has zero languages, language check passes.
- [ ] **AC3** At least one job mode must exist in tutor modes.
- [ ] **AC4** Budget min/max ignored even if extreme.
- [ ] **AC5** Alias “Maths” tutor matches job subject “Mathematics”.
- [ ] **AC6** Replace exact-only filter in `jobs.service.ts` `notifyMatchingTutors`.
- [ ] **AC7** Same match function reused for `/jobs?matched=1` listing (US-4.5).
- [ ] **AC8** Cap notify fanout (e.g. top 50 matches by overlap desc) to protect performance; document cap in code comment.

### API
- Prefer pure function `isJobMatch(tutor, job): { match: boolean; score: number }` in api or shared, with unit tests.

### Edge cases
- Tutor with empty skills → never matches.
- Job with empty modes → should not happen (validation); if it does, no matches.

### Test cases (must automate)
| Tutor skills | Job subject | Modes | Lang | Expect |
|--------------|-------------|-------|------|--------|
| Math, Physics | Mathematics | both ONLINE | both English | match |
| Chemistry | Mathematics | both ONLINE | both English | no |
| Math | Mathematics | tutor HOME only, job ONLINE | English | no |
| Math | Mathematics | ONLINE | tutor Hindi only, job English | no |

---

## US-4.2 — In-app notification per match · P0 · ENHANCE · S

**As a** tutor  
**I want** an in-app notification when a matching job is posted  
**So that** I can open it from Notifications  

### Acceptance criteria
- [ ] **AC1** For each matched tutor, create one `Notification` row: title `New job matching your skills`, body = job title, href=`/jobs/{id}`.
- [ ] **AC2** Idempotent: posting notify twice for same job/tutor does not duplicate (unique handling or delete+create / check existing).
- [ ] **AC3** Unread count on header increments.
- [ ] **AC4** Clicking notification marks read (existing behavior OK) and navigates to job.
- [ ] **AC5** If `notifyMatching=false`, no in-app notification.

---

## US-4.3 — Email notification per match · P0 · NEW · L

**As a** tutor  
**I want** an email for each matching job  
**So that** I see opportunities when I’m offline  

### Acceptance criteria
- [ ] **AC1** After in-app notify create, send email to tutor’s account email.
- [ ] **AC2** Subject: `New tutoring job matching your skills: {title}`.
- [ ] **AC3** Body includes: title, subject, modes, city (if any), CTA link to `{WEB_ORIGIN}/jobs/{id}`.
- [ ] **AC4** Dev without `RESEND_API_KEY`: log email to API console (and do not fail job create).
- [ ] **AC5** Prod with Resend: send; on provider failure log error but **job create still succeeds**; in-app notification still exists.
- [ ] **AC6** Rate limit: max **20** match-emails per tutor per rolling 60 minutes; over cap → skip email, still create in-app notify, log skip.
- [ ] **AC7** No email if `notifyMatching=false` or user blocked.

### Out of scope
- HTML marketing templates; plain transactional email is enough.
- SMS match alerts.

---

## US-4.4 — Notify matching toggle · P0 · EXISTS · S

**As a** tutor  
**I want** to turn job match alerts on or off  
**So that** I control notification volume  

### Acceptance criteria
- [ ] **AC1** Tutor profile/settings exposes `notifyMatching` toggle (default **true** for new tutors).
- [ ] **AC2** OFF → no in-app and no email match alerts for new jobs.
- [ ] **AC3** Toggle persists via existing tutor update API.
- [ ] **AC4** Label copy: “Email & in-app alerts for jobs matching my skills”.

---

## US-4.5 — Matched jobs feed for tutors · P0 · ENHANCE · M

**As a** tutor  
**I want** a jobs list filtered to my matches by default  
**So that** I apply faster  

### Acceptance criteria
- [ ] **AC1** `GET` jobs with `matched=1` uses **same** fuzzy function as US-4.1 (not exact subject).
- [ ] **AC2** When `activeRole=TUTOR`, `/jobs` defaults to matched view OR dashboard CTA opens `/jobs?matched=1` as primary.
- [ ] **AC3** UI shows toggle/tabs: **Matched** | **All jobs** with search on All.
- [ ] **AC4** Each row shows coin price, subject, city, modes, overlap not required to display score (optional).
- [ ] **AC5** Empty matched state: “No matches yet — complete skills on your profile” + link edit profile.

### Edge cases
- Premium early access rules remain as today on top of listing.

---

# Epic 5 — Apply, chat, escrow, unlock

## US-5.1 — Tutor apply with coins · P0 · EXISTS · S

**As a** tutor  
**I want** to spend coins to apply to a job with an intro message  
**So that** I can chat with the student  

### Acceptance criteria
- [ ] **AC1** Job detail shows current coin price from `currentCoinPrice(createdAt, applyCount)`.
- [ ] **AC2** Confirm apply shows “This will use X coins”.
- [ ] **AC3** Insufficient coins → error + link to wallet; no apply row created.
- [ ] **AC4** Intro with phone/email/WA/link rejected or masked per existing rules.
- [ ] **AC5** Success: debit coins, create apply + conversation, open chat.
- [ ] **AC6** Cannot apply twice; cannot apply to own job; cannot apply if job not OPEN.

### Edge cases
- Job becomes free (0 coins) per aging rules — UI must show 0 and allow apply without debit (or debit 0).

---

## US-5.2 — Contact unlock rules · P0 · ENHANCE · M

**As a** student or tutor in a conversation  
**I want** phone and WhatsApp hidden until payment and verification  
**So that** contacts are not leaked early  

### Unlock formula (required)
```
contactUnlocked =
  booking/escrow for this relationship is FUNDED (paid into escrow)
  AND student.emailVerified == true
  AND student.phoneVerified == true   // phone OTP completed
```
Until unlock: in-app chat only.

### Acceptance criteria
- [ ] **AC1** Pre-unlock: UI does not render phone number or WhatsApp button.
- [ ] **AC2** Pre-unlock: outbound messages still run through leak mask/filter.
- [ ] **AC3** Post-unlock: show student and tutor phone (as product does today) + WhatsApp link using digits.
- [ ] **AC4** If escrow paid but phone not verified: show panel “Verify your phone to unlock WhatsApp” + link `/verify` or settings — do **not** reveal numbers.
- [ ] **AC5** If verified but not paid: show “Pay into escrow to unlock phone & WhatsApp”.
- [ ] **AC6** Unlock state is computed server-side; client must not rely only on hiding CSS.

### API
- Conversation/booking payload includes `contactUnlocked: boolean` and `unlockBlockers: ("PAY"|"EMAIL"|"PHONE")[]`.

### Edge cases
- Dispute/refund after unlock: V1 keep contact visible once unlocked for that booking (document in code); do not re-lock mid-thread unless easy.

---

## US-5.3 — Book + escrow pay + release/dispute · P0 · EXISTS · S

**As a** student  
**I want** to pay into escrow and later release or dispute  
**So that** payment is protected  

### Acceptance criteria
- [ ] **AC1** Student can create booking from conversation and pay (Stripe Checkout if keys; else sandbox instant).
- [ ] **AC2** On funded escrow, trigger contact unlock evaluation (US-5.2).
- [ ] **AC3** Release pays tutor minus **12%** platform fee (`PLATFORM_TAKE_BPS = 1200`).
- [ ] **AC4** Dispute path available; admin can resolve per existing tools.
- [ ] **AC5** Clear success screen: “Payment received. Phone & WhatsApp unlocked.” when unlock true.

### Out of scope
- Changing fee percentage.

---

## US-5.4 — Reviews · P0 · EXISTS · S

**As a** student  
**I want** to leave a rating/review after a session  
**So that** other students can choose better  

### Acceptance criteria
- [ ] **AC1** Review can be submitted for eligible booking/tutor (existing rules).
- [ ] **AC2** Review appears on tutor public profile.
- [ ] **AC3** Rating required; body optional.

---

# Epic 6 — Wallet & monetization

## US-6.1 — Wallet balance & ledger · P0 · EXISTS · S

**As a** user  
**I want** to see my coin balance and history  
**So that** I understand spends  

### Acceptance criteria
- [ ] **AC1** `/wallet` shows current coin balance.
- [ ] **AC2** Ledger lists applies, messages, purchases, refunds with notes.
- [ ] **AC3** Balance matches sum of ledger logic already used by API (no client-only math).

---

## US-6.2 — Buy coin packs · P0 · EXISTS · S

**As a** user  
**I want** to buy coin packs  
**So that** I can apply or message  

### Acceptance criteria
- [ ] **AC1** Packs from `COIN_PACKS` displayed with coin count and price.
- [ ] **AC2** Without `STRIPE_SECRET_KEY`: sandbox credits instantly after confirm.
- [ ] **AC3** With Stripe: Checkout session → webhook/confirm credits wallet once.
- [ ] **AC4** Double credit prevented (providerRef unique).
- [ ] **AC5** Error states visible if payment fails.

### P1 follow-up
- Display pack prices in ₹ for India marketing copy (can keep minor units as implemented).

---

## US-6.3 — Premium early access · P1 · EXISTS · S

**As a** tutor  
**I want** premium for early job access  
**So that** I apply before free tutors  

### Acceptance criteria
- [ ] **AC1** Premium purchase/activation works as today (`PREMIUM_COST`, `PREMIUM_DAYS`, `EARLY_ACCESS_HOURS`).
- [ ] **AC2** Non-premium tutors don’t see early jobs until window passes.
- [ ] **AC3** No new subscription SKUs added in V1.

---

## US-6.4 — Referral bonus · P1 · EXISTS · S

**As a** user  
**I want** to invite friends with my code  
**So that** we both get coins per existing rules  

### Acceptance criteria
- [ ] **AC1** Referral code shown in dashboard/wallet.
- [ ] **AC2** Signup with code credits `REFERRAL_BONUS` per existing logic.
- [ ] **AC3** Invalid code → ignore or error without breaking signup.

---

# Epic 7 — Reports & admin

## US-7.1 — Report scam job or tutor · P0 · ENHANCE · M

**As a** user  
**I want** to report a scam job or scam tutor  
**So that** admins can act  

### Background
Prisma `Flag` model exists; need complete user-facing flow + API if incomplete.

### Acceptance criteria
- [ ] **AC1** Job detail page has **Report** control.
- [ ] **AC2** Tutor profile has **Report** control.
- [ ] **AC3** Modal fields:
  - Reason select: `SCAM_JOB` | `SCAM_TUTOR` | `SPAM` | `HARASSMENT` | `OTHER`
  - Notes textarea optional (max 500 chars)
- [ ] **AC4** Submit creates `Flag` with `reporterId`, `targetType` (`JOB`|`USER`), `targetId`, `reason`, `status=OPEN`.
- [ ] **AC5** Success toast: “Thanks. Our team will review.”
- [ ] **AC6** Same user cannot create more than **3** flags on the same target per 24 hours.
- [ ] **AC7** Must be logged in to report.
- [ ] **AC8** Emit `report_submitted` analytics.

### API sketch
`POST /flags` body `{ targetType, targetId, reason, notes? }` → 201  
Auth required.

### Edge cases
- Reporting own job → allow (mistake posts) or block — **block with 400** “You can’t report your own post”.
- Blocked users cannot report.

---

## US-7.2 — Admin report queue + block user · P0 · NEW · L

**As an** admin  
**I want** to review flags and block abusive users  
**So that** the marketplace stays safe  

### Acceptance criteria
- [ ] **AC1** Admin-only page section lists flags `status=OPEN`, newest first, with reporter, reason, target link.
- [ ] **AC2** Actions per flag: **Dismiss** (status DISMISSED), **Resolve** (RESOLVED), **Block user**.
- [ ] **AC3** Block user:
  - Sets `blockedAt=now()`, optional reason from admin note
  - If target is USER, block that user
  - If target is JOB, offer block on job.studentId
  - Sets all OPEN jobs of blocked user to CLOSED
  - Resolves related open flags
  - Emits `user_blocked`
- [ ] **AC4** Non-admin accessing admin APIs gets 403.
- [ ] **AC5** UI shows confirmation modal before block: “Block {name}? They won’t be able to log in.”
- [ ] **AC6** After block, verify US-1.4 behavior.

### Out of scope
- Automatic ML spam detection.
- Permanent hard-delete of user content.

---

## US-7.3 — Support complaint ticket · P1 · EXISTS · S

**As a** user  
**I want** to contact support  
**So that** a human can help outside of flags  

### Acceptance criteria
- [ ] **AC1** `/support` form creates `SupportTicket`.
- [ ] **AC2** Admin can view tickets in admin area.
- [ ] **AC3** User sees confirmation after submit.

---

# Epic 8 — UX simplification

## US-8.1 — Simplify public home · P0 · ENHANCE · M

**As a** first-time visitor  
**I want** a simple first screen with one clear action  
**So that** I am not confused like on crowded marketplaces  

### Acceptance criteria
- [ ] **AC1** Above the fold includes: brand, **one** headline, **one** short supporting sentence, search **or** primary CTA group (max 2 buttons).
- [ ] **AC2** Remove or move below fold the dual “Teachers / Teaching jobs” dense category grids from the hero band (they may appear lower as secondary browse).
- [ ] **AC3** Guest primary CTA: **Post a requirement** or **Find tutors** (one emphasized); secondary: **Join as tutor**.
- [ ] **AC4** Logged-in user sees **Go to dashboard** as today or role-appropriate CTA.
- [ ] **AC5** Mobile (375px): no overlapping elements; CTAs tappable (≥44px height).
- [ ] **AC6** Trust bullets (escrow / coins / contact after pay) remain on page but **not** all crammed into first viewport.

### Out of scope
- Full marketing site redesign / new illustration system.

---

## US-8.2 — Slim navigation · P0 · ENHANCE · S

**As a** user  
**I want** fewer top links  
**So that** I always know the next step  

### Acceptance criteria
- [ ] **AC1** Public desktop nav links only: **Find tutors** · **Post a job** · **How it works** (Jobs browse can sit under Find tutors or footer; if kept, max one extra **Jobs** link).
- [ ] **AC2** Student app nav: **Dashboard** · **My posts** · **Find tutors** · **Inbox** · **Wallet**.
- [ ] **AC3** Tutor app nav: **Dashboard** · **Jobs** · **Inbox** · **Wallet** · **Profile** (Applied can be tab inside Jobs).
- [ ] **AC4** Active role visible (chip or switch) at all times when logged in.
- [ ] **AC5** Mobile nav does not require reading 8+ peer links; overflow into Account menu OK.

---

## US-8.3 — Contact lock panel UI · P0 · NEW · M

**As a** user in chat  
**I want** a clear locked/unlocked contact panel  
**So that** I understand why I can’t see the number yet  

### Acceptance criteria
- [ ] **AC1** Shared component `ContactUnlockPanel` used on conversation view.
- [ ] **AC2** Locked state shows:
  - Title: “Contact locked”
  - Text: “Phone & WhatsApp unlock after payment.”
  - Checklist from `unlockBlockers`: Pay into escrow / Verify email / Verify phone with links.
- [ ] **AC3** Unlocked state shows phone + **WhatsApp** button (`https://wa.me/{digits}`).
- [ ] **AC4** Component reads `contactUnlocked` + blockers from API (US-5.2) — no hardcode.
- [ ] **AC5** Accessible: not color-only; icons + text.

---

## US-8.4 — Tutor dashboard jobs-first · P1 · ENHANCE · S

**As a** tutor  
**I want** matched jobs at the top of my dashboard  
**So that** I don’t hunt through generic cards  

### Acceptance criteria
- [ ] **AC1** Below greeting: section **Jobs for you** with up to 5 matched open jobs (or CTA “View N matches”).
- [ ] **AC2** Keep urgent cards only for incomplete profile / missing phone.
- [ ] **AC3** Remove or demote low-value promotional card grids if they compete with jobs.

---

## US-8.5 — How it works copy · P1 · ENHANCE · S

**As a** new user  
**I want** plain-language steps  
**So that** I trust the loop before signing up  

### Acceptance criteria
- [ ] **AC1** Student steps mention: post free → tutors apply → chat in WTWS → pay escrow → phone/WhatsApp unlock.
- [ ] **AC2** Tutor steps mention: complete profile → get match alerts → apply with coins → teach after pay.
- [ ] **AC3** No mention of in-product video classroom as available now.

---

# Epic 9 — Launch readiness

## US-9.1 — Empty states · P0 · ENHANCE · S

**As a** new user  
**I want** guidance when lists are empty  
**So that** I know the next action  

### Acceptance criteria
- [ ] **AC1** Empty my posts → CTA Post requirement.
- [ ] **AC2** Empty matched jobs → CTA Edit skills / Browse all.
- [ ] **AC3** Empty inbox → CTA Find tutors or Browse jobs.
- [ ] **AC4** Empty tutors search → CTA Post requirement.
- [ ] **AC5** Each empty state ≤ 2 lines copy + 1 primary button.

---

## US-9.2 — Legal & support links · P1 · EXISTS · S

**As a** user  
**I want** terms, privacy, refunds, support in the footer  
**So that** I can trust the service  

### Acceptance criteria
- [ ] **AC1** Footer links resolve (no 404).
- [ ] **AC2** Support form reachable.

---

## US-9.3 — Soft launch QA checklist · P0 · NEW · S

**As the** team  
**I want** a written QA script  
**So that** both engineers verify the full loop before release  

### Acceptance criteria
- [ ] **AC1** File `docs/QA-V1-CHECKLIST.md` includes steps:
  1. Register student + tutor (or dual role)
  2. Verify email + phone
  3. Publish tutor (must-haves)
  4. Post job → matching tutor gets in-app + email
  5. Apply with coins → chat locked
  6. Pay escrow → unlock
  7. Report job → admin block → blocked login
  8. Role switch regression
- [ ] **AC2** Checklist signed off (checkbox in PR or doc) before production soft launch.

---

# Out of backlog (do not implement in V1)

| Item | Reason |
|------|--------|
| Video classroom | Explicitly later |
| AI matching / AI tutor | Later |
| Government ID / background check | OTP enough |
| Separate parent accounts | Use student |
| Global expansion | India only |
| Mobile push notifications | Email + in-app |
| New subscription products | Keep existing premium only |
| Auto-ban without admin | Manual only |
| Changing 12% fee | Locked |

---

# Sprint assignment (4 weeks · 2 eng)

### Week 1
US-4.1, US-4.2, US-4.3, US-7.1, US-0.1, US-5.2  

### Week 2
US-2.1, US-8.1, US-8.2, US-8.3, US-4.5, US-3.2  

### Week 3
US-1.4, US-7.2, US-6.2 (harden), US-2.3, US-8.4, US-9.1, US-0.2  

### Week 4
US-9.3 + full regression on EXISTS stories (US-1.1, 1.2, 1.3, 3.1, 3.3, 3.4, 3.5, 5.1, 5.3, 5.4, 6.1) + P1 buffer  

---

# Definition of Done (every story)

1. All AC checkboxes for that story are met.  
2. Manual test notes in PR (steps + result).  
3. No new contact-leak path introduced.  
4. INR default not regressed on new forms.  
5. Typecheck/lint for touched packages passes.  
6. Story ID in PR title: e.g. `feat(US-4.1): fuzzy job matching`.

---

*End of detailed user stories. If AC is ambiguous during build, ask PM — do not invent scope outside this doc.*
