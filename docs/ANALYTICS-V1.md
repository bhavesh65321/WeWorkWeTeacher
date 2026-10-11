# Analytics Events — V1

**Purpose:** Track core funnel events for onboarding measurement.

**Implementation:** Console logging + optional Mixpanel stub (wired later).

---

## Event Reference

### Authentication

#### `signup_completed`
- **When:** Register or Google signup succeeds
- **Payload:** `{ userId, activeRole: "STUDENT" }`
- **Location:** `apps/web/app/register/register-form.tsx`, `apps/web/app/auth/google/callback/route.ts`

#### `otp_verified`
- **When:** Email or phone OTP verify succeeds
- **Payload:** `{ userId, type: "EMAIL" | "PHONE" }`
- **Location:** `apps/web/app/verify/page.tsx`, `apps/api/src/auth/auth.controller.ts`

### Tutor Profile

#### `tutor_published`
- **When:** Tutor profile becomes `isPublished=true`
- **Payload:** `{ userId, activeRole: "TUTOR" }`
- **Location:** `apps/api/src/tutors/tutors.controller.ts` (publish endpoint)

### Jobs

#### `job_posted`
- **When:** Job create succeeds
- **Payload:** `{ userId, activeRole: "STUDENT", jobId, subject }`
- **Location:** `apps/api/src/jobs/jobs.controller.ts` (create endpoint)

#### `job_applied`
- **When:** Tutor apply succeeds
- **Payload:** `{ userId, activeRole: "TUTOR", jobId, coinsSpent }`
- **Location:** `apps/api/src/job-apply/job-apply.controller.ts` (apply endpoint)

### Matching & Notifications

#### `match_notified`
- **When:** After match notifications created
- **Payload:** `{ jobId, matchCount, tutorIds: string[] }`
- **Location:** `apps/api/src/jobs/jobs.service.ts` (notifyMatchingTutors)

### Chat & Contact

#### `chat_started`
- **When:** First message in new conversation OR apply creates conversation
- **Payload:** `{ userId, activeRole: "STUDENT" | "TUTOR", conversationId }`
- **Location:** `apps/api/src/chat/chat.controller.ts` (message endpoint)

#### `contact_unlocked`
- **When:** Contact unlock becomes true for a conversation/booking
- **Payload:** `{ userId, bookingId, conversationId }`
- **Location:** `apps/api/src/bookings/bookings.service.ts` (after escrow paid)

### Payments

#### `escrow_paid`
- **When:** Escrow funding succeeds
- **Payload:** `{ userId, activeRole: "STUDENT", bookingId, amountMinor, currency }`
- **Location:** `apps/api/src/payments/payments.controller.ts` (webhook or confirm endpoint)

### Reports & Moderation

#### `report_submitted`
- **When:** Flag/report created
- **Payload:** `{ userId, targetType: "JOB" | "USER", reason, targetId }`
- **Location:** `apps/api/src/flags/flags.controller.ts` (create endpoint)

#### `user_blocked`
- **When:** Admin blocks a user
- **Payload:** `{ adminId, blockedUserId, reason }`
- **Location:** `apps/api/src/admin/admin.controller.ts` (block endpoint)

---

## Payload Format

All events include:
```json
{
  "event": "event_name",
  "timestamp": "2026-09-06T22:03:00.000Z",
  "userId": "user-id-or-null",
  "activeRole": "STUDENT|TUTOR|ADMIN|null",
  "...": "event-specific fields"
}
```

---

## Console Output

During development, all events log to console:
```
[Analytics] {"event":"signup_completed","timestamp":"2026-09-06T22:03:00.000Z","userId":"abc123","activeRole":"STUDENT"}
```

---

## Future Integration

- Mixpanel: Wire via `window.mixpanel.track()` (web)
- Amplitude: Wire via API endpoint
- Custom dashboard: Consume logs from API console
