import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';

describe('AuthService - OTP Verification (US-1.2)', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let otpService: OtpService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    roles: JSON.stringify(['STUDENT']),
    activeRole: 'STUDENT',
    passwordHash: 'hash',
    dateOfBirth: new Date('2000-01-01'),
    phone: null,
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    googleId: null,
    lastSeenAt: new Date(),
    referralCode: 'code-123',
    referredById: null,
    blockedAt: null,
    blockReason: null,
    premiumUntil: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: {
            generate: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    otpService = module.get<OtpService>(OtpService);
  });

  describe('AC1: /verify supports email OTP and phone OTP flows', () => {
    it('should verify email OTP', async () => {
      // Arrange
      const userId = 'user-123';
      const otp = '123456';
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(otpService, 'verify').mockResolvedValue(true);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUser,
        emailVerifiedAt: new Date(),
      });

      // Act
      const result = await service.verifyOtp(
        { otp, channel: 'EMAIL' },
        userId,
      );

      // Assert
      expect(otpService.verify).toHaveBeenCalledWith(userId, otp, 'EMAIL');
      expect(prisma.user.update).toHaveBeenCalled();
      expect(result.user.emailVerified).toBe(true);
    });

    it('should verify phone OTP', async () => {
      // Arrange
      const userId = 'user-123';
      const otp = '123456';
      const userWithPhone = {
        ...mockUser,
        phone: '+919876543210',
      };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userWithPhone);
      jest.spyOn(otpService, 'verify').mockResolvedValue(true);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...userWithPhone,
        phoneVerifiedAt: new Date(),
      });

      // Act
      const result = await service.verifyOtp(
        { otp, channel: 'PHONE' },
        userId,
      );

      // Assert
      expect(otpService.verify).toHaveBeenCalledWith(userId, otp, 'PHONE');
      expect(prisma.user.update).toHaveBeenCalled();
      expect(result.user.phoneVerified).toBe(true);
    });
  });

  describe('AC2: Settings shows verification status', () => {
    it('should expose emailVerified flag', async () => {
      // Arrange
      const userId = 'user-123';
      const verifiedUser = {
        ...mockUser,
        emailVerifiedAt: new Date(),
      };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(verifiedUser);

      // Act
      const result = await service.me(userId);

      // Assert
      expect(result.emailVerified).toBe(true);
    });

    it('should expose phoneVerified flag', async () => {
      // Arrange
      const userId = 'user-123';
      const verifiedUser = {
        ...mockUser,
        phone: '+919876543210',
        phoneVerifiedAt: new Date(),
      };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(verifiedUser);

      // Act
      const result = await service.me(userId);

      // Assert
      expect(result.phoneVerified).toBe(true);
    });

    it('should show false for unverified email', async () => {
      // Arrange
      const userId = 'user-123';
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      // Act
      const result = await service.me(userId);

      // Assert
      expect(result.emailVerified).toBe(false);
    });

    it('should show false for unverified phone', async () => {
      // Arrange
      const userId = 'user-123';
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      // Act
      const result = await service.me(userId);

      // Assert
      expect(result.phoneVerified).toBe(false);
    });
  });

  describe('AC3: GET /auth/me exposes verification flags', () => {
    it('should return both emailVerified and phoneVerified', async () => {
      // Arrange
      const userId = 'user-123';
      const verifiedUser = {
        ...mockUser,
        emailVerifiedAt: new Date(),
        phone: '+919876543210',
        phoneVerifiedAt: new Date(),
      };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(verifiedUser);

      // Act
      const result = await service.me(userId);

      // Assert
      expect(result).toHaveProperty('emailVerified');
      expect(result).toHaveProperty('phoneVerified');
      expect(result.emailVerified).toBe(true);
      expect(result.phoneVerified).toBe(true);
    });
  });

  describe('AC4: Unverified phone blocks contact unlock', () => {
    it('should reject if phone not verified', async () => {
      // Arrange
      const userId = 'user-123';
      const userWithUnverifiedPhone = {
        ...mockUser,
        phone: '+919876543210',
        phoneVerifiedAt: null,
      };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userWithUnverifiedPhone);

      // Act & Assert
      await expect(service.unlockContact(userId)).rejects.toThrow(
        'No verified mobile for that number',
      );
    });

    it('should allow if phone verified', async () => {
      // Arrange
      const userId = 'user-123';
      const userWithVerifiedPhone = {
        ...mockUser,
        phone: '+919876543210',
        phoneVerifiedAt: new Date(),
      };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userWithVerifiedPhone);

      // Act
      const result = await service.unlockContact(userId);

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should reject invalid OTP', async () => {
      // Arrange
      const userId = 'user-123';
      const otp = '000000';
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(otpService, 'verify').mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.verifyOtp({ otp, channel: 'EMAIL' }, userId),
      ).rejects.toThrow();
    });

    it('should reject if user not found', async () => {
      // Arrange
      const userId = 'non-existent';
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.verifyOtp({ otp: '123456', channel: 'EMAIL' }, userId),
      ).rejects.toThrow();
    });
  });
});
