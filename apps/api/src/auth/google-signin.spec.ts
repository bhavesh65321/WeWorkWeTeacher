import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService - Google Sign-In (US-1.3)', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockGoogleProfile = {
    sub: 'google-123',
    email: 'user@gmail.com',
    email_verified: true,
    name: 'Google User',
    picture: 'https://example.com/pic.jpg',
  };

  const mockUser = {
    id: 'user-123',
    email: 'user@gmail.com',
    name: 'Google User',
    roles: JSON.stringify(['STUDENT']),
    activeRole: 'STUDENT',
    passwordHash: null,
    dateOfBirth: new Date('2000-01-01'),
    phone: null,
    emailVerifiedAt: new Date(),
    phoneVerifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    googleId: 'google-123',
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
              create: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('AC1: /auth/google + callback works', () => {
    it('should generate Google OAuth URL', () => {
      // Arrange
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-secret';

      // Act
      const result = service.googleAuthUrl('http://localhost:3000/auth/google/callback');

      // Assert
      expect(result.url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(result.url).toContain('client_id=test-client-id');
      expect(result.url).toContain('redirect_uri=');
    });

    it('should reject if Google credentials not configured', () => {
      // Arrange
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;

      // Act & Assert
      expect(() => {
        service.googleAuthUrl('http://localhost:3000/auth/google/callback');
      }).toThrow('Google sign-in is not configured');
    });
  });

  describe('AC2: If Google email is not verified, login is rejected', () => {
    it('should reject unverified Google email', async () => {
      // Arrange
      const unverifiedProfile = {
        ...mockGoogleProfile,
        email_verified: false,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Mock fetch for Google token exchange
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          json: async () => unverifiedProfile,
        });

      // Act & Assert
      await expect(
        service.googleExchange('code', 'http://localhost:3000/auth/google/callback'),
      ).rejects.toThrow('Google email is not verified');
    });

    it('should accept verified Google email', async () => {
      // Arrange
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('token');

      // Mock fetch for Google token exchange
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          json: async () => mockGoogleProfile,
        });

      // Act
      const result = await service.googleExchange(
        'code',
        'http://localhost:3000/auth/google/callback',
      );

      // Assert
      expect(result.user).toBeDefined();
      expect(result.token).toBe('token');
    });
  });

  describe('AC3: Returning Google user gets same account', () => {
    it('should return existing user by googleId', async () => {
      // Arrange
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('token');

      // Mock fetch for Google token exchange
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          json: async () => mockGoogleProfile,
        });

      // Act
      const result = await service.googleExchange(
        'code',
        'http://localhost:3000/auth/google/callback',
      );

      // Assert
      expect(result.user.id).toBe('user-123');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          OR: [
            { googleId: 'google-123' },
            { email: 'user@gmail.com' },
          ],
          deletedAt: null,
        },
      });
    });

    it('should return existing user by email if no googleId', async () => {
      // Arrange
      const userWithoutGoogle = {
        ...mockUser,
        googleId: null,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userWithoutGoogle);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('token');

      // Mock fetch for Google token exchange
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          json: async () => mockGoogleProfile,
        });

      // Act
      const result = await service.googleExchange(
        'code',
        'http://localhost:3000/auth/google/callback',
      );

      // Assert
      expect(result.user).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should create new user if not found', async () => {
      // Arrange
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('token');

      // Mock fetch for Google token exchange
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          json: async () => mockGoogleProfile,
        });

      // Act
      const result = await service.googleExchange(
        'code',
        'http://localhost:3000/auth/google/callback',
      );

      // Assert
      expect(result.user).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should not create duplicate accounts', async () => {
      // Arrange - First login
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('token');

      // Mock fetch for Google token exchange
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          json: async () => mockGoogleProfile,
        });

      // Act - First login
      await service.googleExchange(
        'code',
        'http://localhost:3000/auth/google/callback',
      );

      // Arrange - Second login
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      // Mock fetch for second Google token exchange
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          json: async () => mockGoogleProfile,
        });

      // Act - Second login
      const result = await service.googleExchange(
        'code',
        'http://localhost:3000/auth/google/callback',
      );

      // Assert
      expect(result.user.id).toBe('user-123');
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should reject if Google does not return email', async () => {
      // Arrange
      const profileWithoutEmail = {
        ...mockGoogleProfile,
        email: undefined,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Mock fetch for Google token exchange
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          json: async () => ({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          json: async () => profileWithoutEmail,
        });

      // Act & Assert
      await expect(
        service.googleExchange(
          'code',
          'http://localhost:3000/auth/google/callback',
        ),
      ).rejects.toThrow('Google did not return an email');
    });

    it('should reject invalid redirect URI', async () => {
      // Arrange
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-secret';

      // Act & Assert
      await expect(
        service.googleExchange(
          'code',
          'http://malicious.com/callback',
        ),
      ).rejects.toThrow('Invalid Google redirect');
    });
  });
});
