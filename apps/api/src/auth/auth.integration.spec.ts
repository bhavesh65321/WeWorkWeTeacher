import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('US-1.1: One Login + Role Switch - Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AC1: User registers once and receives session', () => {
    it('should register user and return JWT token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
          dateOfBirth: '2000-01-01',
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.activeRole).toBe(Role.STUDENT);
      
      authToken = response.body.token;
      userId = response.body.user.id;
    });

    it('should have both STUDENT and TUTOR roles after enable-tutor', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/enable-tutor')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.user.roles).toContain(Role.STUDENT);
      expect(response.body.user.roles).toContain(Role.TUTOR);
    });
  });

  describe('AC2: Header shows role switch control', () => {
    it('should return user with both roles for header rendering', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.roles).toContain(Role.STUDENT);
      expect(response.body.roles).toContain(Role.TUTOR);
      expect(response.body.activeRole).toBeDefined();
    });
  });

  describe('AC3: Switching updates activeRole via API', () => {
    it('should switch from STUDENT to TUTOR', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.TUTOR });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.user.activeRole).toBe(Role.TUTOR);
      expect(response.body.token).toBeDefined();
    });

    it('should switch from TUTOR back to STUDENT', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.STUDENT });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.user.activeRole).toBe(Role.STUDENT);
    });
  });

  describe('AC4: Switching shows role-specific items', () => {
    it('should return student dashboard when activeRole is STUDENT', async () => {
      // Arrange
      await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.STUDENT });

      // Act
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.activeRole).toBe(Role.STUDENT);
    });

    it('should return tutor dashboard when activeRole is TUTOR', async () => {
      // Arrange
      await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.TUTOR });

      // Act
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.activeRole).toBe(Role.TUTOR);
    });
  });

  describe('AC5: Both roles preserved in roles[]', () => {
    it('should preserve both roles after multiple switches', async () => {
      // Act - Switch to TUTOR
      let response = await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.TUTOR });

      expect(response.body.user.roles).toContain(Role.STUDENT);
      expect(response.body.user.roles).toContain(Role.TUTOR);

      // Act - Switch back to STUDENT
      response = await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.STUDENT });

      // Assert
      expect(response.body.user.roles).toContain(Role.STUDENT);
      expect(response.body.user.roles).toContain(Role.TUTOR);
    });
  });

  describe('AC6: Dashboard content matches active role', () => {
    it('should show student content when activeRole is STUDENT', async () => {
      // Arrange
      await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.STUDENT });

      // Act
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.activeRole).toBe(Role.STUDENT);
      expect(response.body.content).toContain('myPosts');
    });

    it('should show tutor content when activeRole is TUTOR', async () => {
      // Arrange
      await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.TUTOR });

      // Act
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.activeRole).toBe(Role.TUTOR);
      expect(response.body.content).toContain('jobsFeed');
    });
  });

  describe('Regression: Post job as student → switch to tutor → jobs feed loads → switch back → my posts visible', () => {
    it('should maintain data consistency across role switches', async () => {
      // Arrange - Switch to STUDENT
      await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.STUDENT });

      // Act - Post a job
      const jobResponse = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Mathematics',
          description: 'Need help with algebra',
          budget: 500,
          currency: 'INR',
        });

      const jobId = jobResponse.body.id;

      // Act - Switch to TUTOR
      await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.TUTOR });

      // Act - Load jobs feed
      const jobsFeedResponse = await request(app.getHttpServer())
        .get('/jobs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(jobsFeedResponse.status).toBe(200);

      // Act - Switch back to STUDENT
      await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: Role.STUDENT });

      // Act - Check my posts
      const myPostsResponse = await request(app.getHttpServer())
        .get('/jobs/mine')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(myPostsResponse.status).toBe(200);
      expect(myPostsResponse.body).toContainEqual(
        expect.objectContaining({ id: jobId }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should reject switching to role user does not have', async () => {
      // Arrange - Create user with only STUDENT role
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'student-only@example.com',
          password: 'Password123!',
          name: 'Student Only',
          dateOfBirth: '2000-01-01',
        });

      const studentToken = registerResponse.body.token;

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/role')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ role: Role.TUTOR });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Enable this role first');
    });

    it('should reject without valid JWT token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/role')
        .send({ role: Role.TUTOR });

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
