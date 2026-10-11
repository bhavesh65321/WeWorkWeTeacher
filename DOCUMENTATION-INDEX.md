# ApnaTeacher Documentation Index

## 📚 Documentation Files

This directory contains comprehensive documentation of the ApnaTeacher codebase, created to support implementation of Epics 3-7.

### 1. **EXPLORATION-SUMMARY.md** ⭐ START HERE
**Purpose**: High-level overview of the entire project
**Length**: ~300 lines
**Best for**: Getting oriented, understanding project scope

**Contents**:
- Project overview & tech stack
- Project statistics (11 controllers, 10 services, 13 models)
- Architecture highlights & design patterns
- Core features implemented (Epics 1-7 status)
- Database schema summary
- API endpoints summary
- Key business logic
- Development workflow
- Key files to know
- Next steps for implementation

**When to read**: First thing when starting work on the project

---

### 2. **CODEBASE-OVERVIEW.md** 📖 REFERENCE
**Purpose**: Complete technical reference of the codebase
**Length**: ~500 lines
**Best for**: Understanding architecture, finding specific implementations

**Contents**:
- Detailed project structure with file paths
- Complete Prisma database schema (13 models with all fields)
- All 50+ API endpoints organized by module
- 10 core services with key methods explained
- Marketplace rules (coin system, pricing, contact masking)
- Authentication & authorization patterns
- Test patterns (Jest, Supertest)
- Frontend structure (35 pages, 36 components)
- Shared types & constants
- Utilities (json-list, marketplace-rules, analytics)
- Environment variables
- Development commands
- Key patterns & best practices
- Notes for Epic implementation

**When to read**: When you need to understand how something works or find where code lives

---

### 3. **IMPLEMENTATION-PATTERNS.md** 💻 CODE EXAMPLES
**Purpose**: Ready-to-use code patterns and examples
**Length**: ~400 lines
**Best for**: Writing new code, following established patterns

**Contents**:
- Service implementation pattern (CRUD template)
- Controller pattern (HTTP routing)
- DTO pattern (request validation)
- Module pattern (dependency injection)
- Wallet operations pattern (debit/credit coins)
- Escrow flow pattern (booking → payment → release)
- Contact masking pattern (privacy implementation)
- Authorization pattern (ownership & role checks)
- Transaction pattern (multi-step operations)
- Analytics tracking pattern
- Test pattern (Jest with mocking)
- JSON array handling pattern
- Pagination pattern
- Filtering pattern
- Soft delete pattern
- Unique constraint pattern
- Composite unique pattern
- Optional relations pattern
- Batch operations pattern

**When to read**: When implementing new features, use as code templates

---

### 4. **QUICK-REFERENCE.md** ⚡ CHEAT SHEET
**Purpose**: Quick lookup guide for common tasks
**Length**: ~300 lines
**Best for**: During development, quick answers

**Contents**:
- File locations quick map (backend, frontend, database, shared)
- Common tasks checklist:
  - Adding a new endpoint
  - Adding a database model
  - Adding authorization check
  - Adding wallet operation
  - Adding notification
  - Adding analytics event
- Key constants reference (coin values, time values, coin packs, platform fee)
- Common imports (NestJS, Prisma, Auth, Utilities, Validation)
- Error handling quick reference
- Testing quick reference
- Git workflow
- Development workflow
- API testing with cURL
- Environment setup
- Debugging tips
- Performance considerations
- Security considerations
- Monitoring & logging
- Deployment checklist

**When to read**: During development for quick lookups and reminders

---

## 🎯 How to Use This Documentation

### For New Team Members
1. Start with **EXPLORATION-SUMMARY.md** to understand the project
2. Read **CODEBASE-OVERVIEW.md** sections relevant to your work
3. Keep **QUICK-REFERENCE.md** open while coding
4. Reference **IMPLEMENTATION-PATTERNS.md** when writing new code

### For Backend Development
1. Review **CODEBASE-OVERVIEW.md** - Backend section
2. Study **IMPLEMENTATION-PATTERNS.md** - Service/Controller patterns
3. Use **QUICK-REFERENCE.md** - Common tasks & imports
4. Reference specific service implementations in codebase

### For Frontend Development
1. Review **CODEBASE-OVERVIEW.md** - Frontend section
2. Study component structure in codebase
3. Use **QUICK-REFERENCE.md** - API client patterns
4. Reference existing components for patterns

### For Database Work
1. Review **CODEBASE-OVERVIEW.md** - Database Schema section
2. Study **IMPLEMENTATION-PATTERNS.md** - Transaction patterns
3. Use **QUICK-REFERENCE.md** - Database operations
4. Reference schema.prisma for model definitions

### For Testing
1. Review **CODEBASE-OVERVIEW.md** - Test Patterns section
2. Study **IMPLEMENTATION-PATTERNS.md** - Test Pattern
3. Reference existing test files in codebase
4. Use **QUICK-REFERENCE.md** - Testing quick reference

---

## 📊 Quick Stats

### Backend
- **11 Controllers** - HTTP routing
- **10 Services** - Business logic
- **13 Database Models** - Data persistence
- **8 DTOs** - Request validation
- **6 Test Files** - Test coverage
- **50+ API Endpoints** - REST API

### Frontend
- **35 Pages** - User interfaces
- **36 Components** - Reusable UI
- **7 Utilities** - Helper functions

### Database
- **13 Models** - Data structures
- **Relationships** - Foreign keys
- **Indexes** - Query optimization
- **JSON Fields** - Flexible arrays

---

## 🔑 Key Concepts

### Coin Economy
- Students start with 150 coins
- Tutors start with 80 coins
- Job applications cost 0-80 coins (dynamic pricing)
- Messages cost 50 coins
- Premium costs 100 coins for 30 days

### Escrow System
1. Student creates booking
2. Student pays via Stripe
3. Escrow hold created
4. Contact info unmasked
5. Session completed
6. Student releases escrow
7. Tutor receives payout (minus 12% fee)

### Contact Masking
- Phone, email, URLs masked in messages
- Unmasked after escrow is funded
- Prevents off-platform communication

### Role-Based Access
- **STUDENT**: Post jobs, message tutors, book sessions
- **TUTOR**: Apply to jobs, receive messages, conduct sessions
- **ADMIN**: Moderation, user management, refunds

---

## 🚀 Getting Started

### 1. Setup Development Environment
```bash
pnpm install
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### 2. Read Documentation
- Start with EXPLORATION-SUMMARY.md
- Review CODEBASE-OVERVIEW.md sections relevant to your work
- Keep QUICK-REFERENCE.md handy

### 3. Explore Codebase
- Backend: `apps/api/src/`
- Frontend: `apps/web/`
- Database: `apps/api/prisma/schema.prisma`
- Shared: `packages/shared/src/`

### 4. Start Implementing
- Follow patterns in IMPLEMENTATION-PATTERNS.md
- Use QUICK-REFERENCE.md for common tasks
- Reference existing code for examples
- Write tests for new features

---

## 📝 File Locations

### Documentation
- `EXPLORATION-SUMMARY.md` - Project overview
- `CODEBASE-OVERVIEW.md` - Technical reference
- `IMPLEMENTATION-PATTERNS.md` - Code examples
- `QUICK-REFERENCE.md` - Quick lookup guide
- `README.md` - Original project README

### Backend
- `apps/api/src/` - Source code
- `apps/api/prisma/schema.prisma` - Database schema
- `apps/api/prisma/migrations/` - Database migrations

### Frontend
- `apps/web/app/` - Pages
- `apps/web/components/` - Components
- `apps/web/lib/` - Utilities

### Shared
- `packages/shared/src/constants.ts` - Enums & constants
- `packages/shared/src/index.ts` - Type exports

---

## 🔗 Related Resources

### External Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Project Files
- `package.json` - Root package configuration
- `.env` - Environment variables
- `infra/docker-compose.yml` - Database setup

---

## ✅ Checklist for Epic Implementation

- [ ] Read EXPLORATION-SUMMARY.md
- [ ] Review CODEBASE-OVERVIEW.md relevant sections
- [ ] Study IMPLEMENTATION-PATTERNS.md
- [ ] Set up development environment
- [ ] Explore codebase structure
- [ ] Review existing implementations
- [ ] Plan Epic features
- [ ] Implement following patterns
- [ ] Write tests
- [ ] Test locally
- [ ] Create pull request
- [ ] Code review
- [ ] Deploy

---

## 📞 Support

For questions about:
- **Architecture**: See CODEBASE-OVERVIEW.md
- **Code patterns**: See IMPLEMENTATION-PATTERNS.md
- **Quick answers**: See QUICK-REFERENCE.md
- **Project overview**: See EXPLORATION-SUMMARY.md

---

## 📄 Document Metadata

| Document | Lines | Size | Purpose |
|----------|-------|------|---------|
| EXPLORATION-SUMMARY.md | ~300 | 9.5K | Project overview |
| CODEBASE-OVERVIEW.md | ~500 | 21K | Technical reference |
| IMPLEMENTATION-PATTERNS.md | ~400 | 14K | Code examples |
| QUICK-REFERENCE.md | ~300 | 11K | Quick lookup |

**Total Documentation**: ~1,500 lines, ~55K

---

**Last Updated**: September 6, 2026
**Created for**: Epic 3-7 Implementation
**Status**: Complete & Ready for Use
