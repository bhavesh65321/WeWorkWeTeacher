# Implementation Patterns & Code Examples

## Service Implementation Pattern

### Basic Service Structure
```typescript
import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { track } from "../analytics";

@Injectable()
export class FeatureService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDto) {
    // Validate
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    
    // Create with transaction if needed
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.model.create({ data: { ...dto, userId } });
      await tx.ledgerEntry.create({ /* ... */ });
      return item;
    });
  }

  async get(userId: string, id: string) {
    const item = await this.prisma.model.findUnique({ where: { id } });
    if (!item || item.userId !== userId) throw new NotFoundException();
    return item;
  }

  async update(userId: string, id: string, dto: UpdateDto) {
    const item = await this.get(userId, id);
    return this.prisma.model.update({ where: { id }, data: dto });
  }

  async delete(userId: string, id: string) {
    await this.get(userId, id);
    return this.prisma.model.delete({ where: { id } });
  }
}
```

### Controller Pattern
```typescript
import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";
import { FeatureService } from "./feature.service";
import { CreateDto } from "./dto/create.dto";
import { UpdateDto } from "./dto/update.dto";

@Controller("feature")
export class FeatureController {
  constructor(private readonly feature: FeatureService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDto) {
    return this.feature.create(user.sub, dto);
  }

  @Get(":id")
  get(@Param("id") id: string, @CurrentUser() user?: AuthUser) {
    return this.feature.get(user?.sub, id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateDto) {
    return this.feature.update(user.sub, id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  delete(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.feature.delete(user.sub, id);
  }
}
```

## DTO Pattern

```typescript
import { IsString, IsOptional, MinLength, IsEmail, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateFeatureDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  amount?: number;
}
```

## Module Pattern

```typescript
import { Module } from "@nestjs/common";
import { FeatureService } from "./feature.service";
import { FeatureController } from "./feature.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [FeatureService],
  controllers: [FeatureController],
  exports: [FeatureService],
})
export class FeatureModule {}
```

## Wallet Operations Pattern

```typescript
// Debit coins (with validation)
async applyToJob(tutorId: string, jobId: string) {
  const price = 10; // coins
  
  // Debit will throw ConflictException if insufficient coins
  await this.wallet.debitCoins(tutorId, price, "APPLY", "Apply to job", jobId);
  
  // Create conversation after successful debit
  const conversation = await this.prisma.conversation.create({ /* ... */ });
  
  return { conversationId: conversation.id, coinsSpent: price };
}

// Credit coins (always succeeds)
async refundCoins(tutorId: string, amount: number) {
  await this.wallet.creditCoins(tutorId, amount, "REFUND", "Refund reason", refId);
}
```

## Escrow Flow Pattern

```typescript
// 1. Create booking
async createBooking(studentId: string, conversationId: string, startsAt: string) {
  const booking = await this.prisma.booking.create({
    data: {
      conversationId,
      studentId,
      tutorId: convo.tutorId,
      startsAt: new Date(startsAt),
      amountMinor: 5000, // $50.00
      status: "REQUESTED",
    },
  });
  return booking;
}

// 2. Pay for booking (Stripe or Sandbox)
async payBooking(studentId: string, bookingId: string) {
  const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
  
  // Create escrow hold
  await this.prisma.$transaction([
    this.prisma.escrowHold.create({
      data: { bookingId, amountMinor: booking.amountMinor, status: "HELD" },
    }),
    this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    }),
    this.prisma.conversation.update({
      where: { id: booking.conversationId },
      data: { escrowFunded: true }, // Unmask contact info
    }),
  ]);
}

// 3. Release escrow to tutor
async releaseEscrow(studentId: string, bookingId: string) {
  const booking = await this.prisma.booking.findUnique({
    where: { id: bookingId },
    include: { escrow: true },
  });
  
  const fee = platformFee(booking.amountMinor); // 12%
  const net = booking.amountMinor - fee;
  
  await this.prisma.$transaction([
    this.prisma.escrowHold.update({
      where: { id: booking.escrow.id },
      data: { status: "RELEASED", releasedAt: new Date() },
    }),
    this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" },
    }),
  ]);
  
  // Credit tutor's fiat wallet
  await this.wallet.creditFiat(booking.tutorId, net, "ESCROW_RELEASE", `Session payout`, bookingId);
}
```

## Contact Masking Pattern

```typescript
// Mask contact info in messages
async sendMessage(userId: string, conversationId: string, body: string) {
  const convo = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
  
  // Check if escrow is funded
  if (!convo.escrowFunded && containsContactLeak(body)) {
    throw new BadRequestException(
      "Phone, email, and off-platform links stay hidden until the session is paid"
    );
  }
  
  // Store masked version if escrow not funded
  const stored = convo.escrowFunded ? body : maskContact(body);
  
  const msg = await this.prisma.message.create({
    data: { conversationId, senderId: userId, body: stored },
  });
  
  return msg;
}

// When returning messages to client
const messages = t.messages.map((m) => ({
  id: m.id,
  senderId: m.senderId,
  body: masked ? maskContact(m.body) : m.body, // Mask if escrow not funded
  createdAt: m.createdAt.toISOString(),
  mine: m.senderId === userId,
}));
```

## Authorization Pattern

```typescript
// Check ownership
async updateJob(userId: string, jobId: string, dto: UpdateJobDto) {
  const job = await this.prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new NotFoundException("Job not found");
  if (job.studentId !== userId) throw new ForbiddenException();
  
  return this.prisma.job.update({ where: { id: jobId }, data: dto });
}

// Check admin role
private async assertAdmin(userId: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user || !asStringArray(user.roles).includes("ADMIN")) {
    throw new ForbiddenException();
  }
}

// Check blocked status
async applyToJob(tutorId: string, jobId: string) {
  const tutor = await this.prisma.user.findUnique({ where: { id: tutorId } });
  if (tutor?.blockedAt) {
    throw new ForbiddenException("Your account has been blocked. Contact support.");
  }
  // ... continue
}
```

## Transaction Pattern

```typescript
// Multi-step operation with rollback
async complexOperation(userId: string) {
  return this.prisma.$transaction(async (tx) => {
    // Step 1
    const item1 = await tx.model1.create({ data: { /* ... */ } });
    
    // Step 2
    const item2 = await tx.model2.update({
      where: { id: item1.relatedId },
      data: { /* ... */ },
    });
    
    // Step 3
    await tx.ledgerEntry.create({
      data: { /* ... */ },
    });
    
    return { item1, item2 };
  });
}
```

## Analytics Tracking Pattern

```typescript
// Track important events
async register(dto: RegisterDto) {
  const user = await this.prisma.user.create({ data: { /* ... */ } });
  
  track("signup_completed", user.id, user.activeRole);
  
  return user;
}

async applyToJob(tutorId: string, jobId: string) {
  // ... create application
  
  track("job_applied", tutorId, "TUTOR", { jobId, coinsSpent: price });
  track("chat_started", tutorId, "TUTOR", { conversationId: conversation.id });
  
  return { conversationId: conversation.id };
}
```

## Test Pattern

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { FeatureService } from "./feature.service";
import { PrismaService } from "../prisma/prisma.service";

describe("FeatureService - User Story", () => {
  let service: FeatureService;
  let prisma: PrismaService;

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    // ... other fields
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            model: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("create", () => {
    it("AC1: should create item successfully", async () => {
      // Arrange
      const userId = "user-123";
      const dto = { title: "Test", description: "Test description" };
      
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser);
      jest.spyOn(prisma.model, "create").mockResolvedValue({
        id: "item-123",
        ...dto,
        userId,
      });

      // Act
      const result = await service.create(userId, dto);

      // Assert
      expect(result.id).toBe("item-123");
      expect(prisma.model.create).toHaveBeenCalledWith({
        data: { ...dto, userId },
      });
    });

    it("AC2: should throw if user not found", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.create("invalid-id", {})).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
```

## JSON Array Handling Pattern

```typescript
// Store arrays as JSON
const user = await this.prisma.user.create({
  data: {
    email: "test@example.com",
    roles: jsonList(["STUDENT", "TUTOR"]), // Convert to JSON
    // ...
  },
});

// Retrieve and convert back
const roles = asStringArray(user.roles); // ["STUDENT", "TUTOR"]

// For skills with levels
const skills = asSkills(tutorProfile.skills); // [{ name: "Math", level: "ADVANCED" }]
```

## Pagination Pattern

```typescript
async list(userId: string, skip = 0, take = 20) {
  const items = await this.prisma.model.findMany({
    where: { userId },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
  
  const total = await this.prisma.model.count({ where: { userId } });
  
  return { items, total, skip, take };
}
```

## Filtering Pattern

```typescript
async search(query: SearchQuery) {
  const where: Prisma.ModelWhereInput = {};
  
  if (query.status) where.status = query.status;
  if (query.city) where.city = { contains: query.city };
  if (query.minPrice) where.price = { gte: query.minPrice };
  if (query.maxPrice) where.price = { ...where.price, lte: query.maxPrice };
  
  return this.prisma.model.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
```

## Soft Delete Pattern

```typescript
// Mark as deleted
async delete(userId: string, id: string) {
  return this.prisma.model.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

// Exclude deleted in queries
async list(userId: string) {
  return this.prisma.model.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}
```

## Unique Constraint Pattern

```typescript
// Check for duplicates
async create(userId: string, dto: CreateDto) {
  const existing = await this.prisma.model.findUnique({
    where: { uniqueField: dto.uniqueField },
  });
  
  if (existing) throw new ConflictException("Already exists");
  
  return this.prisma.model.create({
    data: { ...dto, userId },
  });
}
```

## Composite Unique Pattern

```typescript
// Check composite unique
const existing = await this.prisma.jobApply.findUnique({
  where: { jobId_tutorId: { jobId, tutorId } },
});

if (existing) throw new ConflictException("Already applied");
```

## Optional Relations Pattern

```typescript
// Include optional relations
const item = await this.prisma.model.findUnique({
  where: { id },
  include: {
    user: true,
    relatedItem: true, // Will be null if not exists
  },
});

// Check if exists
if (item.relatedItem) {
  // Use related item
}
```

## Batch Operations Pattern

```typescript
// Update multiple records
await this.prisma.notification.updateMany({
  where: { userId, readAt: null },
  data: { readAt: new Date() },
});

// Delete multiple records
await this.prisma.ledgerEntry.deleteMany({
  where: { walletId, createdAt: { lt: cutoffDate } },
});
```
