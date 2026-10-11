# Quick Reference Guide for Epic Implementation

## File Locations Quick Map

### Backend (NestJS)
```
apps/api/src/
├── auth/                    # Authentication & JWT
│   ├── auth.service.ts      # Core auth logic
│   ├── auth.controller.ts   # HTTP endpoints
│   ├── jwt-auth.guard.ts    # JWT validation
│   ├── otp.service.ts       # OTP generation/verification
│   └── dto/                 # Request DTOs
├── jobs/                    # Job posting & search
│   ├── jobs.service.ts
│   ├── jobs.controller.ts
│   └── dto/
├── chat/                    # Messaging & applications
│   ├── chat.service.ts
│   ├── chat.controller.ts
│   └── chat.module.ts
├── booking/                 # Session booking & escrow
│   ├── booking.service.ts
│   ├── booking.controller.ts
│   └── booking.module.ts
├── wallet/                  # Coin & fiat management
│   ├── wallet.service.ts
│   ├── wallet.controller.ts
│   └── wallet.module.ts
├── payments/                # Stripe integration
│   ├── payments.service.ts
│   ├── payments.controller.ts
│   └── payments.module.ts
├── tutors/                  # Tutor profiles & search
│   ├── tutors.service.ts
│   ├── tutors.controller.ts
│   └── dto/
├── notifications/           # User notifications
│   ├── notifications.service.ts
│   ├── notifications.controller.ts
│   └── notifications.module.ts
├── admin/                   # Admin operations
│   ├── admin.controller.ts
│   └── admin.module.ts
├── support/                 # Support tickets
│   ├── support.controller.ts
│   └── support.module.ts
├── prisma/                  # Database service
│   └── prisma.service.ts
├── app.module.ts            # Root module
├── main.ts                  # Entry point
├── marketplace-rules.ts     # Business logic constants
├── analytics.ts             # Event tracking
└── json-list.ts             # JSON utilities
```

### Database
```
apps/api/prisma/
├── schema.prisma            # Data models
├── migrations/              # Migration history
└── seed.ts                  # Database seeding
```

### Frontend (Next.js)
```
apps/web/
├── app/                     # Pages (App Router)
│   ├── page.tsx             # Home
│   ├── register/
│   ├── login/
│   ├── dashboard/
│   ├── jobs/
│   ├── tutors/
│   ├── inbox/
│   ├── wallet/
│   ├── settings/
│   ├── admin/
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── job-card.tsx
│   ├── tutor-card.tsx
│   ├── conversation-view.tsx
│   └── ...
└── lib/                     # Utilities
    ├── api.ts               # API client
    ├── session.ts           # Session management
    ├── analytics.ts         # Frontend analytics
    └── ...
```

### Shared
```
packages/shared/src/
├── index.ts                 # Type exports
└── constants.ts             # Enums & constants
```

## Common Tasks Checklist

### Adding a New Endpoint

1. **Create DTO** (`src/feature/dto/create.dto.ts`)
   ```typescript
   import { IsString, MinLength } from "class-validator";
   
   export class CreateFeatureDto {
     @IsString()
     @MinLength(3)
     name: string;
   }
   ```

2. **Add Service Method** (`src/feature/feature.service.ts`)
   ```typescript
   async create(userId: string, dto: CreateFeatureDto) {
     // Validate, create, track
     track("feature_created", userId);
     return item;
   }
   ```

3. **Add Controller Method** (`src/feature/feature.controller.ts`)
   ```typescript
   @Post()
   @UseGuards(JwtAuthGuard)
   create(@CurrentUser() user: AuthUser, @Body() dto: CreateFeatureDto) {
     return this.feature.create(user.sub, dto);
   }
   ```

4. **Update Module** (`src/feature/feature.module.ts`)
   - Already imports PrismaModule
   - Already exports service

5. **Add to App Module** (`src/app.module.ts`)
   - Import FeatureModule in imports array

6. **Test** (`src/feature/feature.service.spec.ts`)
   - Mock Prisma
   - Test success & error cases

### Adding a Database Model

1. **Update Schema** (`prisma/schema.prisma`)
   ```prisma
   model Feature {
     id        String   @id @default(cuid())
     userId    String
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     name      String
     createdAt DateTime @default(now())
   }
   ```

2. **Create Migration**
   ```bash
   pnpm db:migrate
   ```

3. **Update Service** to use new model

### Adding Authorization Check

```typescript
// Check ownership
if (item.userId !== userId) throw new ForbiddenException();

// Check admin
const user = await this.prisma.user.findUnique({ where: { id: userId } });
if (!asStringArray(user.roles).includes("ADMIN")) throw new ForbiddenException();

// Check blocked
if (user.blockedAt) throw new ForbiddenException("Account blocked");
```

### Adding Wallet Operation

```typescript
// Debit coins
await this.wallet.debitCoins(userId, 50, "APPLY", "Apply to job", jobId);

// Credit coins
await this.wallet.creditCoins(userId, 50, "REFUND", "Refund reason", refId);

// Credit fiat
await this.wallet.creditFiat(userId, 5000, "ESCROW_RELEASE", "Session payout", bookingId);
```

### Adding Notification

```typescript
await this.notifications.create(
  userId,
  "Notification Title",
  "Notification body text",
  "/path/to/resource"
);
```

### Adding Analytics Event

```typescript
track("event_name", userId, activeRole, { customProp: value });
```

## Key Constants Reference

### Coin Values
- STUDENT_STARTER_COINS: 150
- TUTOR_STARTER_COINS: 80
- REFERRAL_BONUS: 50
- STUDENT_MESSAGE_COST: 50
- PREMIUM_COST: 100

### Time Values
- EARLY_ACCESS_HOURS: 1
- PREMIUM_DAYS: 30
- UNREAD_REFUND_MS: 14 days
- MAX_JOBS_PER_DAY: 5

### Coin Packs
- 50 coins → $5.00
- 200 coins → $18.00
- 500 coins → $40.00

### Platform Fee
- 12% (1200 bps)

## Common Imports

```typescript
// NestJS
import { Injectable, BadRequestException, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import { Body, Controller, Get, Post, Patch, Delete, Param, UseGuards } from "@nestjs/common";

// Prisma
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

// Auth
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";

// Utilities
import { asStringArray, jsonList } from "../json-list";
import { track } from "../analytics";

// Validation
import { IsString, IsEmail, MinLength, IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
```

## Error Handling Quick Reference

```typescript
// 400 Bad Request
throw new BadRequestException("Invalid input");

// 401 Unauthorized
throw new UnauthorizedException("Not authenticated");

// 403 Forbidden
throw new ForbiddenException("Not authorized");

// 404 Not Found
throw new NotFoundException("Resource not found");

// 409 Conflict
throw new ConflictException("Already exists");
```

## Testing Quick Reference

```typescript
// Mock Prisma method
jest.spyOn(prisma.model, "findUnique").mockResolvedValue(mockData);

// Mock to throw
jest.spyOn(prisma.model, "create").mockRejectedValue(new Error("DB error"));

// Verify called with
expect(prisma.model.create).toHaveBeenCalledWith({ data: expectedData });

// Verify called times
expect(prisma.model.update).toHaveBeenCalledTimes(1);
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/epic-3-user-stories

# Make changes
git add .
git commit -m "feat: implement user story"

# Push
git push origin feature/epic-3-user-stories

# Create PR on GitHub
```

## Development Workflow

```bash
# Start dev servers
pnpm dev

# Run tests
pnpm test

# Lint
pnpm lint

# Build
pnpm build

# Database operations
pnpm db:migrate    # Create migration
pnpm db:seed       # Seed data
pnpm db:reset      # Reset database
```

## API Testing with cURL

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test","dateOfBirth":"2000-01-01"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (with token)
curl -X GET http://localhost:4000/api/auth/me \
  -H "Cookie: wtws_token=<token>"

# Create job
curl -X POST http://localhost:4000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Cookie: wtws_token=<token>" \
  -d '{"title":"Math Tutor","description":"Need help with algebra","subject":"Math"}'
```

## Environment Setup

```bash
# Copy env template
cp .env.example .env

# Set required variables
DATABASE_URL=file:./dev.db
API_PORT=4000
WEB_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...

# Start database
pnpm db:up

# Run migrations
pnpm db:migrate

# Seed data
pnpm db:seed

# Start dev servers
pnpm dev
```

## Debugging Tips

1. **Check Prisma logs**
   ```typescript
   // In prisma.service.ts
   this.prisma.$on('query', (e) => console.log(e.query));
   ```

2. **Check analytics events**
   - Look for `[Analytics]` in console logs

3. **Check database**
   ```bash
   # Open SQLite shell
   sqlite3 apps/api/dev.db
   ```

4. **Check API responses**
   - Use browser DevTools Network tab
   - Check response status & body

5. **Check test failures**
   ```bash
   pnpm test -- --verbose
   ```

## Performance Considerations

1. **Database Indexes**
   - Already on: (status, visibility, createdAt), (subject), (userId, createdAt)
   - Add more for frequently filtered fields

2. **Query Optimization**
   - Use `include` for relations
   - Use `select` to limit fields
   - Use `take` for pagination

3. **Caching**
   - Consider Redis for frequently accessed data
   - Cache tutor profiles, job listings

4. **Transactions**
   - Use for multi-step operations
   - Prevents partial updates

## Security Considerations

1. **Input Validation**
   - All DTOs use class-validator
   - Global validation pipe in main.ts

2. **Authorization**
   - JWT in HTTP-only cookies
   - Check ownership before operations
   - Check roles for admin operations

3. **Contact Masking**
   - Phone, email, URLs masked until escrow funded
   - Prevents off-platform communication

4. **Password Security**
   - Bcrypt with salt rounds 10
   - Never store plain passwords

5. **Rate Limiting**
   - Consider adding for auth endpoints
   - Consider adding for payment endpoints

## Monitoring & Logging

1. **Analytics Events**
   - Track important user actions
   - Use `track()` function
   - Logs to console (can integrate with service)

2. **Error Logging**
   - NestJS logs all exceptions
   - Check console for errors

3. **Database Logging**
   - Enable Prisma query logging
   - Check for slow queries

## Deployment Checklist

- [ ] All tests passing
- [ ] No linting errors
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Build succeeds
- [ ] API endpoints tested
- [ ] Frontend pages tested
- [ ] Analytics events firing
- [ ] Error handling working
- [ ] Security checks passed
