# WTWS (WeTeacherWeStudent) — Product Requirements Document
**Version:** 1.0 (India MVP)  
**Status:** Ready for build  
**Timeline:** 4 weeks  
**Team:** 2 engineers  
**Stack:** NestJS API + Next.js web (existing monorepo)  
**Primary goal:** Maximize user onboarding & engagement; revenue secondary  

---

## 1. Executive Summary & Market Context

### 1.1 Product one-liner
WTWS is an India-first tutoring marketplace where students post requirements for free, tutors apply with coins, and phone/WhatsApp unlock only after escrow payment — simpler and cleaner than TeacherOn.

### 1.2 Problem
| Side | Pain |
|------|------|
| **Students / parents** | Hard to find trustworthy home/online tutors; contact details leak early; fear of paying before trust; noisy, cluttered platforms |
| **Tutors** | Job boards are spammy; hard to get quality leads; students share numbers then go offline; no payment protection |
| **Both** | TeacherOn-class UIs feel dense; matching is weak; notifications unreliable |

### 1.3 Solution (V1)
A two-sided marketplace with one login + role switch:
1. Student posts requirement (free) **or** browses tutors.
2. Matching tutors get **email + in-app** alerts (skills ≈30–40% overlap + language + mode; budget ignored).
3. Tutor applies with coins → in-app chat only.
4. Student books → pays escrow → phone/WhatsApp unlock.
5. Release / dispute; reviews; report scam jobs/tutors; admin can block.

### 1.4 Market context (India V1)
- Global online tutoring ~$14B (2025) → ~$34B (2030), ~20% CAGR; Asia-Pacific fastest growing.
- India demand is strong for **home tutors + online + assignment help** (exam culture, CBSE/ICSE/State boards, JEE/NEET, college).
- TeacherOn is the closest competitor pattern; differentiation is **simpler UX, clearer trust loop, reliable matching notifications**, not feature count.

### 1.5 Competitive differentiation
| | TeacherOn-like | **WTWS V1** |
|--|----------------|-------------|
| UI | Dense, many flows | Simple, one job per screen |
| Contact | Often leaks early | Locked until escrow |
| Matching alerts | Inconsistent | Email + in-app on every match |
| Roles | Split mental model | One account, role switch |
| India focus | Broad | India-first copy, INR default, local languages on profiles |

### 1.6 Non-goals (V1)
- Video classroom / live lessons on platform  
- AI tutor matching / AI teaching  
- Global multi-currency expansion  
- ID / background verification  
- Parent-as-separate-role (parent uses student account)  
- B2B school contracts  

---

## 2. User Personas & Core User Journeys

### 2.1 Personas

**P1 — Priya (Student / Parent proxy)**  
- Needs Math/Science home tutor in Pune, or online for boards.  
- Wants safe contact, clear price, quick responses.  
- Success: posts once → gets applicants → pays once → starts classes.

**P2 — Amina (Tutor)**  
- Teaches online + home; multiple subjects; watches job feed.  
- Wants relevant alerts, fair coin spend, paid sessions without ghosting.  
- Success: gets match alerts → applies → books → escrow released.

**P3 — Admin**  
- Handles reports, scam flags, blocks abusive users, refunds edge cases.

### 2.2 Account model
- **One identity** (email/Google + phone OTP).  
- **Role switch:** Student ↔ Tutor (can be both).  
- Personal details shared across roles.  
- Dashboards must **not** mix role chrome (student menu ≠ tutor menu).

### 2.3 Onboarding journeys

#### Student onboarding (happy path)
1. Register / Google → email OTP → phone OTP.  
2. Light student onboarding: city, subjects needed, preferred mode.  
3. CTA fork: **Post a requirement** (primary) | **Find tutors**.  
4. Land on student dashboard (My posts, Find tutors, Messages, Wallet).

#### Tutor onboarding (happy path)
1. Same account → switch to Tutor **or** register as tutor.  
2. Complete **must-have** profile (block publish until done).  
3. Toggle “Notify me of matching jobs” (default ON).  
4. Land on tutor dashboard (Jobs, Applied, Wallet, Profile).

### 2.4 Primary workflows

#### A. Post → Match → Apply → Chat → Pay → Unlock
```
Student posts job (free)
  → Matching tutors notified (email + in-app)
  → Tutor applies (coins) + intro (no contact leak)
  → In-app chat
  → Student books & pays escrow
  → Phone + WhatsApp unlock
  → Teach offline/online outside video product
  → Student releases escrow (platform fee) OR disputes
  → Review
```

#### B. Browse tutor → Message (coins) → Pay → Unlock
```
Student finds tutor
  → Pays coins to start conversation
  → Chat (no phone/WA)
  → Book + escrow
  → Contact unlock
```

#### C. Report & trust
```
User flags job or tutor (scam/fraud)
  → Ticket for admin
  → Admin reviews → warn / block / refund coins if policy says so
```

---

## 3. Detailed Scope for Version 1

### 3.1 Build / ship (IN)

#### Identity & verification
- [x] Email + password, Google OAuth  
- [x] Email OTP + mobile OTP  
- [ ] Gate contact unlock on **verified email + verified phone + escrow paid**  
- [ ] Clear “Verified” badges on profiles/posts  

#### Profiles
**Tutor must-have (publish blocked without):**
- Display name, photo, city, teaching modes, ≥1 skill/subject, rate + currency (INR default), languages (≥1), short bio  

**Tutor nice-to-have (V1 optional):**
- Intro video, courses list, gender, works-as (individual/agency), travel radius  

**Student must-have:**
- Name, city, phone verified  

#### Jobs / requirements
- Student posts free (cap: keep existing daily limit)  
- Modes: Online, Home, Travel, Assignment  
- Types: Tutoring + Assignment help  
- No contact leak in job body (existing filter)  
- My Posts: edit, close, filled  

#### Matching & notifications (GAP vs current — priority)
**Current gap:** matching is mostly exact subject.  
**V1 requirement:**
- Match if **≥30–40% skill overlap** AND compatible **language** AND compatible **mode**  
- **Do not** filter on budget  
- Notify **every** matching published tutor with `notifyMatching=true`  
- Channels: **in-app + email** (both mandatory)  
- Email must include job title, city/mode, deep link to job  

#### Applications & coins
- Dynamic coin price to apply (existing rules OK)  
- Intro message required; contact leak blocked  
- Wallet: balance, history, buy packs (Stripe + sandbox fallback)  
- Premium: early job access (existing) — keep, don’t expand  

#### Messaging & contact
- In-app chat only before pay  
- Mask phone/email/WA/links in chat until unlock  
- After escrow: show phone + WhatsApp CTA  
- Direct message from tutor profile costs coins (keep)  

#### Payments & escrow
- Book → pay escrow → release / dispute  
- Platform fee: **12%** (keep)  
- INR primary  

#### Trust & admin
- Report: scam job / scam tutor (reason + free text)  
- Admin: list reports, **manually block users**, close abusive jobs  
- Support complaint flow (lightweight ticket)  

#### UX polish (differentiation)
- Simplify navigation per role  
- Reduce clutter on home, post job, apply  
- India-first copy; INR; Hindi/English as top languages  

### 3.2 Explicitly CUT from V1 (OUT)
| Feature | Why cut |
|---------|---------|
| Video classroom | Stated later; 4-week constraint |
| AI matching / AI tutor | Post-PMF |
| Intro video required | Nice-to-have only |
| Background / ID KYC | OTP+email enough for V1 |
| Separate parent accounts | Use student role |
| B2B / school portals | V2+ |
| Global expansion / multi-market | India only |
| Push notifications (mobile app) | Web email+in-app enough |
| Complex subscription SKUs | Keep existing premium only |
| Auto-ban without admin | Manual action only |

### 3.3 Known gaps & edge cases to handle in V1

| Risk | Mitigation |
|------|------------|
| Notification spam (every match) | Digest optional later; V1: rate-limit email (e.g. max N/hour) + clear unsubscribe/notify toggle |
| Fuzzy skill match false positives | Normalize skills (aliases: “Maths”↔“Mathematics”); threshold 35% Jaccard or similar |
| Tutor applies, student never replies | Unread refund policy (existing) — surface in UI |
| Contact leak via creative spelling | Keep filters; report path |
| Student under 13 | Keep MIN_AGE gate |
| Dual-role confusion | Hard split dashboards; role chip always visible |
| Escrow disputes | Admin manual resolve |
| Stripe failures | Clear error + sandbox only in non-prod |
| Empty marketplace cold start | Seed tutors/jobs; give generous starter coins; referral bonus |
| Assignment academic integrity | Disclaimer in assignment jobs; no essay-mill marketing |

### 3.4 4-week delivery plan (2 engineers)

| Week | Focus |
|------|--------|
| **W1** | Fuzzy match engine + email+in-app notify; report/flag APIs; India defaults (INR, copy) |
| **W2** | Profile must-have gates; role-clean dashboards; contact unlock = verified+paid; UX simplification of post/apply |
| **W3** | Admin block + reports queue; Stripe coin packs hardening; empty states & onboarding polish |
| **W4** | Bug bash, trust copy, analytics events, soft launch India |

---

## 4. UX/UI Design Guidelines & Interaction Principles

### 4.1 Design north star
**“Simpler than TeacherOn.”**  
One purpose per screen. Primary CTA obvious. No dense link farms in first viewport.

### 4.2 Principles
1. **Role clarity** — Always show active role; menus never mix tutor/student tasks.  
2. **Trust before contact** — Never show phone/WA until escrow + verification.  
3. **Progressive disclosure** — Must-have fields first; advanced profile later.  
4. **Low friction post** — Posting a job ≤60 seconds on mobile.  
5. **Feedback always** — After apply/pay/report, confirm next step in plain language.  
6. **Mobile-first India** — Large tap targets, works on mid-range Android Chrome.

### 4.3 Key screens (V1 priority)
1. Home (search + post CTA)  
2. Post requirement (short form)  
3. Tutor jobs feed (matched toggle default ON for tutors)  
4. Job detail + Apply  
5. Inbox / conversation (locked contact strip)  
6. Checkout / escrow  
7. Tutor profile edit (must-have checklist)  
8. Wallet  
9. Report modal  
10. Admin reports + block  

### 4.4 Microcopy examples
- Contact locked: “Phone & WhatsApp unlock after payment.”  
- Apply: “Uses X coins. Chat stays in WTWS.”  
- Match email subject: “New tutoring job matching your skills: {title}”

### 4.5 Accessibility & content
- Contrast WCAG AA for primary actions  
- Hindi labels optional later; V1 UI English + India-friendly wording  
- No dark-pattern coin spends — show balance before confirm  

---

## 5. Technical & Integration Considerations

### 5.1 Stack (confirmed)
- **Web:** Next.js (apps/web)  
- **API:** NestJS (apps/api)  
- **DB:** Prisma + SQLite (dev) → plan Postgres for prod India  
- **Shared:** packages/shared marketplace constants  
- **Payments:** Stripe Checkout for coin packs / escrow when keys present  

*Not FastAPI — stay on current NestJS monorepo.*

### 5.2 Matching algorithm (new/enhanced)
```
score = skill_overlap_ratio  // intersection / union of normalized skills
match if:
  score >= 0.35
  AND languages_intersect
  AND modes_intersect (job mode ∈ tutor modes)
  AND tutor.isPublished
  AND tutor.notifyMatching
  AND tutor.userId != studentId
Ignore budget entirely.
```
- Persist notification rows (in-app).  
- Send email via Resend (prod) / log+echo (dev).  
- Idempotency: one notification per (tutor, job).

### 5.3 Contact unlock rule
```
unlocked = escrow.status == FUNDED
        && student.emailVerified
        && student.phoneVerified
```

### 5.4 Reporting
- Entity: `Report { reporterId, targetType: JOB|USER, targetId, reason, notes, status }`  
- Admin endpoints: list, resolve, `blockUser(userId)`.  
- Blocked users cannot login / apply / post.

### 5.5 Compatibility with existing modules
Reuse: auth, OTP, jobs, applies, chat leak filter, wallet, escrow, premium, admin tickets.  
Extend: matching, email notify, reports, profile publish gates, India defaults.

### 5.6 Analytics events (minimum)
`signup_completed`, `otp_verified`, `tutor_published`, `job_posted`, `match_notified`, `job_applied`, `chat_started`, `escrow_paid`, `contact_unlocked`, `report_submitted`, `user_blocked`

### 5.7 Security / abuse
- Existing contact leak filters stay on.  
- Rate-limit job posts & apply.  
- Admin-only block.  
- No PII in emails beyond what’s needed.

---

## 6. Success Metrics & KPIs

**North star (V1):** Activated users (students who post OR tutors who publish), not revenue.

### 6.1 Product-market fit signals (60–90 days)
| Metric | Target (directional) |
|--------|----------------------|
| New signups (India) | Trend up week-over-week |
| Tutor profiles published | ≥40% of tutor signups |
| Jobs posted / week | Steady growth |
| Apply rate | ≥1 apply on ≥50% of jobs within 48h |
| Match → open email/in-app | ≥30% CTR on match notifications |
| Chat started after apply | ≥40% |
| Escrow paid (conversion) | Track; no hard revenue gate |
| D7 retention (any role) | ≥20% |

### 6.2 Engagement KPIs
- Median time to first job post (student)  
- Median time to first apply (tutor)  
- % conversations with contact unlock  
- Report rate (watch for abuse spikes)  

### 6.3 Guardrail metrics
- Tutor coin burn without replies (refund health)  
- Dispute rate after escrow  
- Notification unsubscribe / notifyMatching OFF rate (if >25%, tune matching)  

### 6.4 Explicitly de-prioritized for V1 success
- GMV, take-rate optimization, premium upsell %  
(OK to be low while onboarding grows.)

---

## 7. Open decisions (non-blocking for start)
1. Exact skill overlap threshold: **35%** default (within 30–40%).  
2. Match email rate limit: **20/hour/tutor** suggested.  
3. Prod DB: Postgres on Indian region preferred.  
4. Branding: ship as **WeTeacherWeStudent** or consumer name **ApnaTeacher** for India marketing — pick before soft launch.

---

## 8. Acceptance criteria (V1 done)
1. Student in India can post Online/Home/Assignment job in &lt;60s.  
2. Matching tutors get **both** in-app + email for fuzzy skill+language+mode match.  
3. Apply costs coins; chat cannot reveal phone/WA pre-pay.  
4. Escrow pay unlocks phone + WhatsApp only if email+phone verified.  
5. Users can report job/tutor; admin can block.  
6. Role switch works; dashboards stay role-clean.  
7. Coin packs purchasable (Stripe or sandbox).  
8. No video classroom required.  
9. UI visibly simpler than TeacherOn on home, post, and apply flows.

---

## Document control
| Field | Value |
|-------|--------|
| Author | Product (PM + design + eng alignment) |
| Based on | Handwritten requirements + clarifying answers (2026-09-06) + existing WTWS codebase |
| Next step | Eng break W1 tickets from §3.4; design simplify home/post/apply |
