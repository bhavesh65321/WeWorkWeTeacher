import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TutorsService - Profile Checklist (US-2.1)', () => {
  let service: TutorsService;
  let prisma: PrismaService;

  const mockProfile = {
    id: 'profile-123',
    userId: 'user-123',
    slug: 'john-doe',
    headline: 'Expert Math Tutor',
    bio: 'I have 10 years of experience teaching mathematics to students of all levels.',
    photoUrl: '/api/uploads/tutors/photo.jpg',
    hourlyRateMinor: 50000,
    currency: 'INR',
    city: 'Mumbai',
    country: 'India',
    subjects: JSON.stringify(['Math', 'Physics']),
    modes: JSON.stringify(['ONLINE', 'HOME']),
    languages: JSON.stringify(['English', 'Hindi']),
    rateType: 'HOURLY',
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorsService,
        {
          provide: PrismaService,
          useValue: {
            tutorProfile: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TutorsService>(TutorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('AC1: API rejects publish if must-haves missing', () => {
    it('should reject publish without photo', async () => {
      // Arrange
      const profileWithoutPhoto = {
        ...mockProfile,
        photoUrl: null,
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(profileWithoutPhoto);

      // Act & Assert
      await expect(
        service.update('user-123', { isPublished: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject publish without headline', async () => {
      // Arrange
      const profileWithoutHeadline = {
        ...mockProfile,
        headline: null,
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(profileWithoutHeadline);

      // Act & Assert
      await expect(
        service.update('user-123', { isPublished: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject publish without bio', async () => {
      // Arrange
      const profileWithoutBio = {
        ...mockProfile,
        bio: 'Short',
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(profileWithoutBio);

      // Act & Assert
      await expect(
        service.update('user-123', { isPublished: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject publish without modes', async () => {
      // Arrange
      const profileWithoutModes = {
        ...mockProfile,
        modes: JSON.stringify([]),
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(profileWithoutModes);

      // Act & Assert
      await expect(
        service.update('user-123', { isPublished: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject publish without skills', async () => {
      // Arrange
      const profileWithoutSkills = {
        ...mockProfile,
        subjects: JSON.stringify([]),
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(profileWithoutSkills);

      // Act & Assert
      await expect(
        service.update('user-123', { isPublished: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject publish without rate', async () => {
      // Arrange
      const profileWithoutRate = {
        ...mockProfile,
        hourlyRateMinor: null,
        rateType: 'HOURLY',
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(profileWithoutRate);

      // Act & Assert
      await expect(
        service.update('user-123', { isPublished: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow publish with FREE rate and no hourly rate', async () => {
      // Arrange
      const profileWithFreeRate = {
        ...mockProfile,
        hourlyRateMinor: null,
        rateType: 'FREE',
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(profileWithFreeRate);
      jest.spyOn(prisma.tutorProfile, 'update').mockResolvedValue(profileWithFreeRate);

      // Act
      const result = await service.update('user-123', { isPublished: true });

      // Assert
      expect(result).toBeDefined();
    });

    it('should reject publish without languages', async () => {
      // Arrange
      const profileWithoutLanguages = {
        ...mockProfile,
        languages: JSON.stringify([]),
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(profileWithoutLanguages);

      // Act & Assert
      await expect(
        service.update('user-123', { isPublished: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject publish without city', async () => {
      // Arrange
      const profileWithoutCity = {
        ...mockProfile,
        city: null,
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(profileWithoutCity);

      // Act & Assert
      await expect(
        service.update('user-123', { isPublished: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow publish with all required fields', async () => {
      // Arrange
      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(mockProfile);
      jest.spyOn(prisma.tutorProfile, 'update').mockResolvedValue(mockProfile);

      // Act
      const result = await service.update('user-123', { isPublished: true });

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('AC6: Saving drafts allowed', () => {
    it('should allow saving partial profile without publishing', async () => {
      // Arrange
      const incompleteProfile = {
        ...mockProfile,
        photoUrl: null,
        isPublished: false,
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(incompleteProfile);
      jest.spyOn(prisma.tutorProfile, 'update').mockResolvedValue(incompleteProfile);

      // Act
      const result = await service.update('user-123', { headline: 'New Headline' });

      // Assert
      expect(result).toBeDefined();
      expect(result.isPublished).toBe(false);
    });
  });

  describe('Auto-unpublish logic', () => {
    it('should auto-unpublish if required field removed', async () => {
      // Arrange
      const publishedProfile = {
        ...mockProfile,
        isPublished: true,
      };

      const updatedProfile = {
        ...publishedProfile,
        photoUrl: null,
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(publishedProfile);
      jest.spyOn(prisma.tutorProfile, 'update')
        .mockResolvedValueOnce(updatedProfile)
        .mockResolvedValueOnce({ ...updatedProfile, isPublished: false });

      // Act
      const result = await service.update('user-123', { photoUrl: null });

      // Assert
      expect(result.isPublished).toBe(false);
    });
  });

  describe('Error messages', () => {
    it('should list all missing fields in error message', async () => {
      // Arrange
      const incompleteProfile = {
        ...mockProfile,
        photoUrl: null,
        headline: null,
        bio: 'Short',
      };

      jest.spyOn(prisma.tutorProfile, 'findUnique').mockResolvedValue(incompleteProfile);

      // Act & Assert
      await expect(
        service.update('user-123', { isPublished: true }),
      ).rejects.toThrow(/profile photo|headline|bio/);
    });
  });
});
