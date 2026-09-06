import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { Role } from '@prisma/client';

describe('AuthService - Role Switch (US-1.1)', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    roles: JSON.stringify(['STUDENT', 'TUTOR']),
    activeRole: 'STUDENT',
    passwordHash: 'hash',
    dateOfBirth: new Date('2000-01-01'),
    phone: null,
    emailVerifiedAt: new Date(),
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
              create: jest.fn(),
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
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('switchRole', () => {
    it('AC3: should update activeRole via API', async () => {
      // Arrange
      const userId = 'user-123';
      const newRole = Role.TUTOR;
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUser,
        activeRole: newRole,
      });
      jest.spyOn(jwt, 'sign').mockReturnValue('new-token');

      // Act
      const result = await service.switchRole(userId, newRole);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { activeRole: newRole },
      });
      expect(result.user.activeRole).toBe(newRole);
    });

    it('AC5: should preserve both roles in roles[]', async () => {
      // Arrange
      const userId = 'user-123';
      const newRole = Role.TUTOR;
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUser,
        activeRole: newRole,
      });
      jest.spyOn(jwt, 'sign').mockReturnValue('new-token');

      // Act
      const result = await service.switchRole(userId, newRole);

      // Assert
      expect(result.user.roles).toContain('STUDENT');
      expect(result.user.roles).toContain('TUTOR');
      expect(result.user.roles.length).toBe(2);
    });

    it('should validate user has the role before switching', async () => {
      // Arrange
      const userId = 'user-123';
      const userWithoutTutor = {
        ...mockUser,
        roles: JSON.stringify(['STUDENT']),
      };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userWithoutTutor);

      // Act & Assert
      await expect(service.switchRole(userId, Role.TUTOR)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const userId = 'non-existent';
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.switchRole(userId, Role.TUTOR)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should switch from TUTOR to STUDENT', async () => {
      // Arrange
      const userId = 'user-123';
      const userAsTutor = {
        ...mockUser,
        activeRole: 'TUTOR',
      };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userAsTutor);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...userAsTutor,
        activeRole: Role.STUDENT,
      });
      jest.spyOn(jwt, 'sign').mockReturnValue('new-token');

      // Act
      const result = await service.switchRole(userId, Role.STUDENT);

      // Assert
      expect(result.user.activeRole).toBe(Role.STUDENT);
    });

    it('should return updated user with new JWT token', async () => {
      // Arrange
      const userId = 'user-123';
      const newRole = Role.TUTOR;
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUser,
        activeRole: newRole,
      });
      jest.spyOn(jwt, 'sign').mockReturnValue('new-token');

      // Act
      const result = await service.switchRole(userId, newRole);

      // Assert
      expect(result.token).toBe('new-token');
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(userId);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with only STUDENT role trying to switch to TUTOR', async () => {
      // Arrange
      const userId = 'user-123';
      const studentOnlyUser = {
        ...mockUser,
        roles: JSON.stringify(['STUDENT']),
      };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(studentOnlyUser);

      // Act & Assert
      await expect(service.switchRole(userId, Role.TUTOR)).rejects.toThrow(
        'Enable this role first',
      );
    });

    it('should allow switching to same role (idempotent)', async () => {
      // Arrange
      const userId = 'user-123';
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('token');

      // Act
      const result = await service.switchRole(userId, Role.STUDENT);

      // Assert
      expect(result.user.activeRole).toBe(Role.STUDENT);
    });
  });
});
