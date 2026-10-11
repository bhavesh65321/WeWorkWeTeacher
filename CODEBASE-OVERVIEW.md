# ApnaTeacher Codebase Overview

## Project Structure

```
ApnaTeacher/
├── apps/
│   ├── api/                 # NestJS backend (port 4000)
│   │   ├── src/
│   │   │   ├── admin/       # Admin operations & moderation
│   │   │   ├── auth/        # Authentication & authorization
│   │   │   ├── booking/     # Session booking & escrow
│   │   │   ├── chat/        # Messaging & job applications
│   │   │   ├── jobs/        # Job posting & management
│   │   │   ├── notifications/ # User notifications
│   │   │   ├── payments/    # Stripe integration
│   │   │   ├── prisma/      # Database service
│   │   │   ├── support/     # Support tickets
│   │   │   ├── tutors/      # Tutor profiles & search
│   │   │   ├── wallet/      # Coin & fiat wallet
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── analytics.ts
│   │   │   ├── json-list.ts
│   │   │   ├── marketplace-rules.ts
│   │   │   └── json-list.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── package.json
│   ├── web/                 # Next.js frontend (port 3000)
│   │   ├── app/             # Pages (App Router)
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities & API client
│   │   └── package.json
│   └── ui/                  # Shared UI components
├── packages/
│   ├── shared/              # Shared types & constants
│   │   ├── src/
│   │   │   ├── index.ts     # Type exports
│   │   │   └── constants.ts # Enums & constants
│   │   └── package.json
│   └── ui/
├── infra/
│   └── docker-compose.yml   # SQLite database setup
├── package.json             # Monorepo root (pnpm)
└── .env                     # Environment variables
```

## Database Schema (Prisma)

### Core Models

**User**
- `id` (cuid, PK)
- `email` (unique)
- `passwordHash` (nullable for Google auth)
- `name`, `dateOfBirth`, `phone`
- `googleId` (unique, nullable)
- `emailVerifiedAt`, `phoneVerifiedAt`
- `roles` (JSON array: STUDENT, TUTOR, ADMIN)
- `activeRole` (current role)
- `blockedAt`, `blockReason` (moderation)
- `referralCode`, `referredById` (referral system)
- `premiumUntil` (premium membership)
- `lastSeenAt`, `deletedAt`
- Relations: studentProfile, tutorProfile, wallet, messages, conversations, bookings, reviews, flags, notifications, payments, tickets

**StudentProfile**
- `id`, `userId` (unique)
- `city`, `country`
- `defaultVisibility` (PUBLIC/PRIVATE)

**TutorProfile**
- `id`, `userId` (unique)
- `slug` (unique, URL-friendly)
- `headline`, `bio`
- `hourlyRateMinor`, `hourlyRateMaxMinor` (in cents)
- `currency` (default: USD)
- `timezone`, `city`, `country`
- `languages`, `subjects`, `modes`, `levels` (JSON arrays)
- `teachingApproach`, `experience`, `education`
- `freeTrialMinutes`, `yearsTeaching`, `yearsOnline`
- `gender`, `worksAs` (INDIVIDUAL/AGENCY)
- `ratingAvg`, `reviewCount`
- `isPublished`, `notifyMatching`
- `photoUrl`, `rateType` (HOURLY/MONTHLY/COURSE/FREE)

**Job**
- `id`, `studentId` (FK)
- `title`, `description`, `type` (TUTORING/ASSIGNMENT)
- `modes` (JSON: ONLINE, HOME, TRAVEL, ASSIGNMENT)
- `visibility` (PUBLIC/PRIVATE)
- `subject`, `level`, `city`, `country`
- `budgetMin`, `budgetMax`, `currency`
- `whenNeeded`, `frequency`, `budgetType`, `genderPref`
- `status` (OPEN/CLOSED/FILLED)
- `applyCount`, `createdAt`, `updatedAt`
- Indexes: (status, visibility, createdAt), (subject)

**Wallet**
- `id`, `userId` (unique)
- `coinBalance`, `fiatMinor` (in cents)
- Relations: entries (LedgerEntry[])

**LedgerEntry**
- `id`, `walletId` (FK)
- `amount`, `unit` (COIN/FIAT)
- `type` (STARTER, REFERRAL, APPLY, MESSAGE, PURCHASE, REFUND, ESCROW_RELEASE, ADMIN)
- `note`, `refId`, `createdAt`

**JobApply**
- `id`, `jobId`, `tutorId` (unique together)
- `coinsSpent`, `conversationId` (unique)
- `studentReadAt`, `refundedAt`, `createdAt`

**Conversation**
- `id`, `threadKey` (unique)
- `jobId` (nullable), `studentId`, `tutorId`
- `escrowFunded` (boolean)
- `createdAt`
- Relations: messages, bookings, apply

**Message**
- `id`, `conversationId`, `senderId`
- `body` (masked until escrow funded)
- `createdAt`

**Booking**
- `id`, `conversationId`, `studentId`, `tutorId`
- `startsAt`, `durationMin` (default: 60)
- `amountMinor`, `currency`
- `status` (REQUESTED/CONFIRMED/COMPLETED/DISPUTED)
- `disputedAt`, `disputeReason`
- `createdAt`
- Relations: escrow, review

**EscrowHold**
- `id`, `bookingId` (unique)
- `amountMinor`, `status` (HELD/RELEASED)
- `createdAt`, `releasedAt`

**Review**
- `id`, `bookingId` (unique)
- `fromId`, `toId` (reviewer, reviewee)
- `rating`, `body`, `createdAt`

**Flag**
- `id`, `reporterId`
- `targetType`, `targetId` (flexible reporting)
- `reason`, `status` (OPEN/RESOLVED)
- `createdAt`

**Payment**
- `id`, `userId`
- `kind` (COIN_PACK/ESCROW)
- `status` (PENDING/PAID)
- `coins`, `bookingId`, `amountMinor`, `currency`
- `provider` (STRIPE/SANDBOX)
- `providerRef`, `createdAt`, `paidAt`

**SupportTicket**
- `id`, `userId` (nullable), `email`, `name`
- `topic`, `body`, `status` (OPEN/CLOSED)
- `adminNote`, `createdAt`

**Notification**
- `id`, `userId`
- `title`, `body`, `href`
- `readAt`, `createdAt`
- Index: (userId, createdAt)

**OtpChallenge**
- `id`, `userId` (nullable)
- `channel` (EMAIL/PHONE)
- `purpose` (VERIFY/LOGIN/RESET)
- `destination`, `codeHash`
- `attempts`, `expiresAt`, `consumedAt`, `createdAt`
- Index: (destination, purpose, createdAt)

## API Endpoints

### Authentication (`/auth`)
- `POST /register` - Register new user
- `POST /login` - Email/password login
- `POST /logout` - Clear auth cookie
- `GET /me` - Current user profile
- `PATCH /profile` - Update profile (phone, city, country, name)
- `GET /export` - Export user data
- `DELETE /me` - Delete account
- `POST /enable-tutor` - Enable tutor role
- `POST /role` - Switch active role
- `GET /methods` - Available auth methods
- `GET /google/url` - Get Google OAuth URL
- `POST /google/exchange` - Exchange Google code for token
- `POST /forgot-password` - Send password reset OTP
- `POST /reset-password` - Reset password with OTP
- `POST /otp/send` - Send OTP (EMAIL/PHONE, VERIFY/LOGIN/RESET)
- `POST /otp/verify` - Verify OTP code

### Tutors (`/tutors`)
- `GET /` - Search tutors (q, mode, subject, city, level, minRating, maxRate)
- `GET /meta` - Get subjects & cities metadata
- `GET /me` - Current tutor profile
- `PATCH /me` - Update tutor profile
- `POST /me/photo` - Upload tutor photo
- `GET /:slug` - Get tutor by slug

### Jobs (`/jobs`)
- `GET /` - List jobs (mode, subject, type, city, q, matched, level)
- `GET /:id` - Get job details
- `POST /` - Create job
- `PATCH /:id` - Update job
- `DELETE /:id` - Delete job
- `GET /:id/applicants` - List job applicants (student only)
- `POST /:id/close` - Close job (student only)

### Chat (`/chat`)
- `POST /apply` - Apply to job (tutorId, jobId, intro)
- `POST /message-tutor` - Message tutor directly (tutorUserId, intro)
- `GET /` - List conversations
- `GET /:id` - Get conversation with messages
- `POST /:id/send` - Send message
- `POST /refund-unread` - Refund unread applications (admin)

### Booking (`/booking`)
- `POST /` - Create booking (conversationId, startsAt, durationMin)
- `POST /:id/pay` - Pay for booking (Stripe checkout)
- `POST /:id/release` - Release escrow to tutor
- `POST /:id/dispute` - Dispute booking
- `GET /:id` - Get booking details

### Wallet (`/wallet`)
- `GET /` - Get wallet balance & ledger
- `POST /checkout-coins` - Checkout coin pack (Stripe)
- `POST /checkout-coins/sandbox` - Sandbox coin purchase

### Payments (`/payments`)
- `GET /packs` - Get coin packs
- `POST /checkout-coins` - Checkout coins
- `POST /checkout-escrow` - Checkout escrow payment
- `POST /webhook/stripe` - Stripe webhook handler

### Notifications (`/notifications`)
- `GET /` - List notifications (filter: unread/read)
- `POST /:id/read` - Mark notification as read
- `POST /read-all` - Mark all as read

### Admin (`/admin`)
- `GET /overview` - Admin dashboard
- `POST /flags` - Create flag/report
- `POST /flags/:id/resolve` - Resolve flag
- `POST /refund-unread` - Refund unread applications
- `POST /tickets/:id/close` - Close support ticket
- `POST /bookings/:id/refund` - Refund disputed booking
- `POST /jobs/:id/spam` - Mark job as spam & refund
- `POST /credit` - Credit coins to user
- `POST /users/:userId/block` - Block user
- `POST /users/:userId/unblock` - Unblock user

### Support (`/support`)
- `POST /` - Create support ticket

## Key Services

### AuthService
- User registration with email verification
- Password hashing (bcrypt)
- JWT token generation
- Google OAuth integration
- OTP-based verification (email/phone)
- Role management (STUDENT/TUTOR/ADMIN)
- Account deletion & data export
- Referral system (50 coins bonus)

**Key Methods:**
- `register(dto)` - Create user with starter coins
- `login(dto)` - Authenticate user
- `me(userId)` - Get current user profile
- `updateProfile(userId, dto)` - Update user info
- `enableTutor(userId)` - Add tutor role & coins
- `switchRole(userId, role)` - Change active role
- `googleExchange(code, redirectUri)` - OAuth flow
- `sendOtp(dto, userId?)` - Send OTP
- `verifyOtp(dto, userId?)` - Verify OTP code

### ChatService
- Job applications with coin cost
- Direct messaging to tutors
- Contact masking (phone/email/links hidden until escrow funded)
- Unread refund system (14 days)
- Spam job refunds

**Key Methods:**
- `applyToJob(tutorId, jobId, intro)` - Apply with coin debit
- `messageTutor(studentId, tutorUserId, intro)` - Direct message
- `list(userId)` - Get conversations
- `get(userId, id)` - Get conversation with messages
- `send(userId, conversationId, body)` - Send message
- `refundUnread()` - Refund old unread applications
- `refundSpamJob(jobId)` - Refund all applicants

### JobsService
- Job posting & search
- Filtering by mode, subject, city, level
- Early access for premium tutors (1 hour)
- Dynamic coin pricing (0-80 coins based on age & apply count)
- Job applicant management

**Key Methods:**
- `list(query, viewerId?)` - Search jobs
- `get(id, viewerId?)` - Get job details
- `create(studentId, dto)` - Create job
- `update(studentId, id, dto)` - Update job
- `delete(studentId, id)` - Delete job
- `applicants(studentId, jobId)` - List applicants
- `close(studentId, jobId)` - Close job

### BookingService
- Session booking creation
- Escrow payment handling
- Session completion & payout
- Dispute management
- Platform fee calculation (12% = 1200 bps)

**Key Methods:**
- `create(studentId, conversationId, startsAt, durationMin)` - Create booking
- `paySandbox(studentId, bookingId)` - Sandbox payment
- `release(studentId, bookingId)` - Release escrow to tutor
- `dispute(studentId, bookingId, reason)` - Dispute session
- `refundDispute(reason, bookingId)` - Admin refund

### WalletService
- Coin & fiat balance management
- Ledger entry tracking
- Transaction types: STARTER, REFERRAL, APPLY, MESSAGE, PURCHASE, REFUND, ESCROW_RELEASE, ADMIN

**Key Methods:**
- `ensure(userId)` - Create wallet if missing
- `get(userId)` - Get balance & ledger
- `creditCoins(userId, amount, type, note?, refId?)` - Add coins
- `debitCoins(userId, amount, type, note?, refId?)` - Deduct coins
- `creditFiat(userId, amount, type, note?, refId?)` - Add fiat

### PaymentsService
- Stripe integration for coin packs & escrow
- Sandbox mode for testing
- Webhook handling

**Key Methods:**
- `checkoutCoins(userId, coins)` - Checkout coin pack
- `checkoutEscrow(userId, bookingId)` - Checkout escrow
- `handleWebhook(event)` - Process Stripe events

### TutorsService
- Tutor profile management
- Search & filtering
- Photo upload
- Rating & review aggregation

**Key Methods:**
- `search(query)` - Search tutors
- `mine(userId)` - Get own tutor profile
- `updateMine(userId, dto)` - Update profile
- `savePhoto(userId, file)` - Upload photo
- `bySlug(slug)` - Get tutor by slug
- `subjects()` - Get available subjects

### NotificationsService
- Create notifications
- List with filtering
- Mark as read

**Key Methods:**
- `create(userId, title, body, href?)` - Create notification
- `list(userId, filter?)` - List notifications
- `markRead(userId, id?)` - Mark as read

## Marketplace Rules (`marketplace-rules.ts`)

### Coin System
- **STUDENT_STARTER_COINS**: 150
- **TUTOR_STARTER_COINS**: 80
- **REFERRAL_BONUS**: 50
- **STUDENT_MESSAGE_COST**: 50 coins
- **PREMIUM_COST**: 100 coins
- **PREMIUM_DAYS**: 30 days

### Job Application Pricing
```typescript
currentCoinPrice(createdAt, applyCount):
- If applyCount < 3 && age >= 36 hours: 0 coins
- If applyCount === 0 && age < 36 hours: 1 coin
- Otherwise: min(1 + applyCount, 80) coins
```

### Coin Packs
- 50 coins → $5.00
- 200 coins → $18.00
- 500 coins → $40.00

### Platform Fee
- **PLATFORM_TAKE_BPS**: 1200 (12%)
- Formula: `Math.round((amountMinor * 1200) / 10_000)`

### Contact Masking
- Masks: phone numbers, emails, URLs, app names (WhatsApp, Telegram, etc.)
- Unmasked after escrow is funded

### Other Rules
- **MIN_AGE**: 13 years
- **EARLY_ACCESS_HOURS**: 1 hour (premium tutors only)
- **UNREAD_REFUND_MS**: 14 days
- **MAX_JOBS_PER_DAY**: 5

## Authentication & Authorization

### JWT Strategy
- Token stored in `wtws_token` HTTP-only cookie
- Payload: `{ sub: userId, email, activeRole }`
- Guards: `JwtAuthGuard`, `OptionalJwtGuard`

### Roles
- **STUDENT**: Post jobs, message tutors, book sessions
- **TUTOR**: Apply to jobs, receive messages, conduct sessions
- **ADMIN**: Moderation, user management, refunds

### Decorators
- `@CurrentUser()` - Extract JWT payload
- `@UseGuards(JwtAuthGuard)` - Require authentication
- `@UseGuards(OptionalJwtGuard)` - Optional authentication

## Test Patterns (Jest)

### Test Structure
```typescript
describe('Feature - User Story', () => {
  let service: ServiceClass;
  let prisma: PrismaService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServiceClass,
        { provide: PrismaService, useValue: { /* mocks */ } }
      ]
    }).compile();
    service = module.get(ServiceClass);
    prisma = module.get(PrismaService);
  });
  
  it('AC1: should do something', async () => {
    // Arrange
    jest.spyOn(prisma.model, 'method').mockResolvedValue(data);
    
    // Act
    const result = await service.method(input);
    
    // Assert
    expect(result).toEqual(expected);
  });
});
```

### Test Files
- `auth/auth.service.spec.ts` - Auth service tests
- `auth/auth.integration.spec.ts` - Integration tests
- `auth/otp-verification.spec.ts` - OTP flow tests
- `auth/blocked-users.spec.ts` - Blocked user tests
- `auth/google-signin.spec.ts` - Google OAuth tests
- `tutors/tutors.service.spec.ts` - Tutor service tests
- `web/components/*.spec.tsx` - React component tests

## Frontend Structure

### Pages (Next.js App Router)
- `/` - Home page
- `/register` - Registration
- `/login` - Login
- `/auth/google/callback` - Google OAuth callback
- `/verify` - Email/phone verification
- `/dashboard` - User dashboard
- `/jobs` - Job listing
- `/jobs/new` - Create job
- `/jobs/[id]` - Job details
- `/jobs/[id]/edit` - Edit job
- `/jobs/mine` - My posted jobs
- `/tutors` - Tutor search
- `/tutors/[slug]` - Tutor profile
- `/tutors/edit` - Edit tutor profile
- `/inbox` - Conversations
- `/inbox/[id]` - Conversation view
- `/wallet` - Wallet & coin packs
- `/notifications` - Notifications
- `/settings` - User settings
- `/admin` - Admin dashboard
- `/support` - Support tickets

### Key Components
- `Header` - Navigation
- `Footer` - Footer
- `JobCard` - Job listing card
- `TutorCard` - Tutor profile card
- `ConversationView` - Chat interface
- `RoleSwitch` - Switch between STUDENT/TUTOR
- `VerificationStatus` - Email/phone verification
- `StudentPhoneActionCard` - Phone verification prompt
- `ProfileChecklist` - Onboarding checklist
- `ConfirmCheckout` - Payment confirmation

### API Client (`lib/api.ts`)
```typescript
apiGet<T>(path: string): Promise<T>
apiGetOptional<T>(path: string): Promise<T | null>
listTutors(params)
getTutor(slug)
listJobs(params)
getJob(id)
getMe()
getMeta()
```

## Shared Types & Constants (`packages/shared`)

### Types
- `PublicUser` - User profile
- `TutorCard` - Tutor display data
- `JobCard` - Job display data
- `JobApplicant` - Applicant info
- `TutorReview` - Review data

### Enums
- `Role`: STUDENT, TUTOR, ADMIN
- `TeachingMode`: ONLINE, HOME, TRAVEL, ASSIGNMENT
- `JobType`: TUTORING, ASSIGNMENT
- `JobVisibility`: PUBLIC, PRIVATE
- `JobStatus`: OPEN, CLOSED, FILLED
- `Level`: School, High school, Undergraduate, Graduate, Professional, Test prep
- `WhenNeeded`: ASAP, THIS_WEEK, FLEXIBLE
- `JobFrequency`: ONCE, WEEKLY, DAILY
- `BudgetType`: HOURLY, MONTHLY, COURSE, FREE
- `RateType`: HOURLY, MONTHLY, COURSE, FREE
- `Currency`: USD, INR, EUR, GBP, AED, CAD, AUD, SGD
- `SkillLevel`: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- `GenderPref`: ANY, FEMALE, MALE
- `TutorGender`: FEMALE, MALE, OTHER, UNDISCLOSED
- `TutorWorksAs`: INDIVIDUAL, AGENCY

### Constants
- `SKILL_SUGGESTIONS` - 50+ skill examples
- `LANGUAGE_OPTIONS` - 20+ languages
- `MODE_LABELS`, `FREQUENCY_LABELS`, `BUDGET_TYPE_LABELS` - UI labels

## Utilities

### `json-list.ts`
- `asStringArray(value)` - Convert JSON to string array
- `asSkills(value)` - Convert JSON to skill objects
- `jsonList(values)` - Convert array to JSON
- `jsonSkills(values)` - Convert skills to JSON

### `marketplace-rules.ts`
- `containsContactLeak(text)` - Detect phone/email/URL/apps
- `maskContact(text)` - Mask contact info
- `currentCoinPrice(createdAt, applyCount)` - Calculate apply cost
- `normalizePhone(raw)` - Validate & format phone
- `platformFee(amountMinor)` - Calculate 12% fee

### `analytics.ts`
- `track(eventName, userId?, activeRole?, props?)` - Log analytics event
- Logs to console in JSON format

## Environment Variables

```env
# Database
DATABASE_URL=file:./dev.db

# API
API_PORT=4000
WEB_ORIGIN=http://localhost:3000

# Authentication
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Payments
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...

# Email/OTP (optional)
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build
pnpm build

# Database
pnpm db:up          # Start Docker container
pnpm db:down        # Stop Docker container
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed database
pnpm db:reset       # Reset database

# Linting
pnpm lint
```

## Key Patterns & Best Practices

### Service Layer Pattern
- Services handle business logic
- Controllers handle HTTP routing
- Prisma for database access
- Transactions for multi-step operations

### Error Handling
- NestJS exceptions: `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`
- Validation via `class-validator` DTOs
- Global validation pipe in `main.ts`

### Database Transactions
```typescript
await this.prisma.$transaction(async (tx) => {
  // Multiple operations
});
```

### Contact Masking
- Phone, email, URLs masked in messages until escrow funded
- Prevents off-platform communication before payment

### Coin System
- Debit before creating conversation (prevents overdraft)
- Refund if unread after 14 days
- Dynamic pricing based on job age & apply count

### Escrow Flow
1. Student creates booking
2. Student pays via Stripe/Sandbox
3. Escrow hold created
4. Conversation unlocked (contact info visible)
5. Session completed
6. Student releases escrow
7. Tutor receives payout (minus 12% fee)

## Notes for Epic Implementation

### For Epics 3-7 Implementation:
1. **Follow existing patterns** - Use same service/controller structure
2. **Use Prisma transactions** - For multi-step operations
3. **Validate with DTOs** - Use class-validator
4. **Track analytics** - Call `track()` for important events
5. **Handle errors properly** - Use appropriate NestJS exceptions
6. **Test with Jest** - Mock Prisma, follow existing test patterns
7. **Update shared types** - Add new types to `packages/shared`
8. **Maintain backward compatibility** - Don't break existing endpoints
9. **Use contact masking** - For sensitive data in messages
10. **Consider coin economy** - Ensure pricing is balanced

### Database Considerations:
- SQLite for development (can migrate to PostgreSQL)
- Indexes on frequently queried fields
- JSON fields for flexible arrays (subjects, modes, languages, etc.)
- Soft deletes via `deletedAt` field
- Timestamps on all models

### API Considerations:
- All endpoints prefixed with `/api`
- JWT auth via cookies (HTTP-only)
- CORS enabled for web origin
- Global validation pipe
- File uploads to `/api/uploads/`
