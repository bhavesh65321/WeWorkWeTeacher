# Codebase Exploration Summary

## Overview
ApnaTeacher is a full-stack tutoring marketplace built with:
- **Backend**: NestJS + Prisma + SQLite
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **Monorepo**: pnpm workspaces
- **Architecture**: Modular service-based design

## Project Statistics

### Backend (apps/api)
- **11 Controllers** - Auth, Jobs, Chat, Booking, Wallet, Payments, Tutors, Notifications, Admin, Support, Health
- **10 Services** - Core business logic
- **13 Database Models** - User, Job, Tutor, Booking, Wallet, Chat, Notifications, etc.
- **8 DTOs** - Request validation
- **6 Test Files** - Auth, OTP, Google OAuth, Blocked users, Tutors
- **3 Utility Files** - Analytics, JSON handling, Marketplace rules

### Frontend (apps/web)
- **35 Pages** - Home, Auth, Dashboard, Jobs, Tutors, Inbox, Wallet, Admin, etc.
- **36 Components** - Reusable UI components
- **7 Utilities** - API client, Session, Analytics, Money formatting, Time utilities

### Database
- **13 Models** with relationships
- **Indexes** on frequently queried fields
- **Soft deletes** via deletedAt
- **JSON fields** for flexible arrays

## Architecture Highlights

### Layered Architecture
```
Controller (HTTP) → Service (Business Logic) → Prisma (Database)
                ↓
            DTOs (Validation)
```

### Key Design Patterns
1. **Dependency Injection** - NestJS modules
2. **Guard-based Authorization** - JWT + Role checks
3. **Transaction Support** - Multi-step operations
4. **Contact Masking** - Privacy until payment
5. **Coin Economy** - Dynamic pricing system
6. **Escrow Payments** - Secure session funding

## Core Features Implemented

### 1. Authentication (Epic 1)
- Email/password registration & login
- Google OAuth integration
- OTP verification (email/phone)
- Password reset flow
- Role management (STUDENT/TUTOR/ADMIN)
- Account deletion & data export

### 2. User Profiles (Epic 2)
- Student profiles (city, country, visibility)
- Tutor profiles (rates, subjects, languages, modes, experience)
- Photo uploads
- Verification status (email, phone)
- Premium membership

### 3. Job Marketplace (Partial - Epic 3)
- Job posting (title, description, budget, modes)
- Job search & filtering
- Job applicant management
- Job status tracking (OPEN/CLOSED/FILLED)
- Early access for premium tutors

### 4. Chat & Applications (Partial - Epic 4)
- Job applications with coin cost
- Direct messaging to tutors
- Contact masking (phone/email/links hidden)
- Conversation threading
- Unread refund system (14 days)

### 5. Booking & Escrow (Partial - Epic 5)
- Session booking creation
- Escrow payment via Stripe
- Sandbox mode for testing
- Session completion & payout
- Dispute handling

### 6. Wallet & Payments (Partial - Epic 6)
- Coin balance management
- Fiat wallet for payouts
- Ledger tracking
- Coin packs (50/200/500)
- Stripe integration

### 7. Admin & Moderation (Partial - Epic 7)
- User blocking/unblocking
- Flag/report system
- Support ticket management
- Spam job handling
- Manual coin credits
- Booking refunds

## Database Schema Summary

### User Management
- **User** - Core user with roles, verification, blocking
- **StudentProfile** - Student-specific data
- **TutorProfile** - Tutor-specific data with rates, subjects, skills

### Marketplace
- **Job** - Job postings with budget, modes, visibility
- **JobApply** - Applications with coin tracking
- **Conversation** - Chat threads between student & tutor
- **Message** - Individual messages (masked until escrow)

### Payments & Wallet
- **Wallet** - Coin & fiat balances
- **LedgerEntry** - Transaction history
- **Payment** - Stripe payment records
- **EscrowHold** - Session payment holds

### Sessions & Reviews
- **Booking** - Session bookings with status
- **Review** - Session reviews & ratings

### Moderation & Support
- **Flag** - User reports
- **SupportTicket** - Support requests
- **Notification** - User notifications
- **OtpChallenge** - OTP verification

## API Endpoints Summary

### Authentication (13 endpoints)
- Register, Login, Logout, Me, Profile, Export, Delete
- Enable Tutor, Switch Role
- Google OAuth, OTP Send/Verify
- Password Reset

### Tutors (5 endpoints)
- Search, Get by slug, Get own profile
- Update profile, Upload photo

### Jobs (6 endpoints)
- List, Get, Create, Update, Delete
- Get applicants, Close job

### Chat (5 endpoints)
- Apply to job, Message tutor
- List conversations, Get conversation
- Send message

### Booking (4 endpoints)
- Create booking, Pay, Release escrow, Dispute

### Wallet (2 endpoints)
- Get balance, Checkout coins

### Payments (3 endpoints)
- Get packs, Checkout coins, Checkout escrow

### Notifications (3 endpoints)
- List, Mark read, Mark all read

### Admin (8 endpoints)
- Overview, Flags, Refunds, Tickets
- Block/Unblock users, Credit coins

### Support (1 endpoint)
- Create ticket

## Key Business Logic

### Coin System
- Students start with 150 coins
- Tutors start with 80 coins
- Referral bonus: 50 coins
- Message cost: 50 coins
- Premium: 100 coins for 30 days

### Job Application Pricing
- Dynamic pricing based on job age & apply count
- Free after 36 hours if < 3 applies
- 1 coin for first apply within 1 hour
- Up to 80 coins for heavily applied jobs

### Escrow & Payouts
- Student pays for session via Stripe
- Amount held in escrow
- Contact info unmasked after payment
- Tutor receives payout minus 12% platform fee

### Contact Masking
- Phone, email, URLs masked in messages
- Unmasked after escrow is funded
- Prevents off-platform communication

## Testing Infrastructure

### Test Coverage
- Auth service (registration, login, role switching)
- OTP verification flow
- Google OAuth integration
- Blocked user handling
- Tutor service

### Test Patterns
- Jest with Prisma mocking
- Arrange-Act-Assert structure
- Mock data fixtures
- Error case testing

## Frontend Architecture

### Pages Structure
- Public pages (home, tutors, jobs)
- Auth pages (register, login, verify)
- Protected pages (dashboard, inbox, wallet)
- Admin pages (overview, moderation)

### Component Hierarchy
- Layout components (Header, Footer)
- Feature components (JobCard, TutorCard, ConversationView)
- Form components (RegisterForm, LoginForm)
- Utility components (RoleSwitch, VerificationStatus)

### API Client
- Server-side fetch with cookie handling
- Type-safe API calls
- Error handling
- Optional authentication

## Development Workflow

### Setup
```bash
pnpm install
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### Development
- API: http://localhost:4000
- Web: http://localhost:3000
- Database: SQLite (dev.db)

### Testing
```bash
pnpm test
pnpm lint
```

### Database
```bash
pnpm db:migrate    # Create migration
pnpm db:seed       # Seed data
pnpm db:reset      # Reset database
```

## Key Files to Know

### Backend Core
- `apps/api/src/app.module.ts` - Root module
- `apps/api/src/main.ts` - Entry point
- `apps/api/prisma/schema.prisma` - Database schema
- `apps/api/src/marketplace-rules.ts` - Business constants

### Services
- `apps/api/src/auth/auth.service.ts` - Authentication
- `apps/api/src/chat/chat.service.ts` - Messaging
- `apps/api/src/jobs/jobs.service.ts` - Job management
- `apps/api/src/booking/booking.service.ts` - Session booking
- `apps/api/src/wallet/wallet.service.ts` - Wallet management
- `apps/api/src/payments/payments.service.ts` - Stripe integration

### Frontend Core
- `apps/web/app/layout.tsx` - Root layout
- `apps/web/lib/api.ts` - API client
- `apps/web/components/header.tsx` - Navigation

### Shared
- `packages/shared/src/constants.ts` - Enums & constants
- `packages/shared/src/index.ts` - Type exports

## Ready for Epic 3-7 Implementation

The codebase is well-structured and ready for implementing Epics 3-7:

✅ **Established Patterns**
- Service/Controller/Module structure
- DTO validation
- Authorization checks
- Error handling

✅ **Core Infrastructure**
- Database with relationships
- JWT authentication
- Wallet system
- Escrow payments
- Analytics tracking

✅ **Testing Framework**
- Jest setup
- Prisma mocking
- Test patterns

✅ **Frontend Foundation**
- Next.js App Router
- Component library
- API client
- Authentication flow

## Documentation Files Created

1. **CODEBASE-OVERVIEW.md** (500+ lines)
   - Complete architecture reference
   - All models, endpoints, services
   - Patterns and best practices

2. **IMPLEMENTATION-PATTERNS.md** (400+ lines)
   - Code examples for common tasks
   - Service/Controller patterns
   - Wallet, escrow, authorization patterns
   - Testing patterns

3. **QUICK-REFERENCE.md** (300+ lines)
   - File location map
   - Common tasks checklist
   - Constants reference
   - Debugging tips
   - Deployment checklist

## Next Steps for Epic Implementation

1. **Review Documentation**
   - Read CODEBASE-OVERVIEW.md for architecture
   - Study IMPLEMENTATION-PATTERNS.md for code examples
   - Use QUICK-REFERENCE.md during development

2. **Set Up Development Environment**
   - Clone repository
   - Run `pnpm install`
   - Set up database
   - Start dev servers

3. **Implement Epic Features**
   - Follow established patterns
   - Use provided code examples
   - Write tests for new features
   - Track analytics events

4. **Test & Deploy**
   - Run test suite
   - Check linting
   - Build for production
   - Deploy to staging/production

## Summary

The ApnaTeacher codebase is a well-architected, production-ready tutoring marketplace with:
- Clear separation of concerns
- Established design patterns
- Comprehensive database schema
- Secure authentication & authorization
- Coin-based economy with escrow payments
- Modular, extensible architecture

All documentation needed for implementing Epics 3-7 has been created and is ready for use.
