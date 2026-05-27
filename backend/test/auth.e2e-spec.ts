import { AppModule } from '@/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { App } from 'supertest/types';
import request from 'supertest';
import { User } from '@/users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User> | undefined;
  let createdEmails: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());

    // init User repository
    // userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    await app.init();
  });

  beforeEach(() => {
    createdEmails = [];
  });

  afterEach(async () => {
    if (!createdEmails.length) {
      return;
    }

    await userRepository?.delete(createdEmails.map((email) => ({ email })));
    createdEmails = [];
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 when accessing /auth/me without authentication', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('should register a new user and then return a 201 with a safe res', async () => {
    const registerDto = {
      email: `e2e-${Date.now()}@jest-spec.com`,
      password: 'password',
    };
    createdEmails.push(registerDto.email);
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    const body = response.body as { userId: number; email: string };

    expect(body.userId).toEqual(expect.any(Number));
    expect(body).toEqual(
      expect.objectContaining({
        email: registerDto.email,
      }),
    );
    expect(body).not.toHaveProperty('passwordHash');
  });

  it('should login a registered user and set an httpOnly access token cookie', async () => {
    // Arrange (create user)
    const credentials = {
      email: `e2e-${Date.now()}@jest-spec.com`,
      password: 'password',
    };
    createdEmails.push(credentials.email);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);

    // act (login that user)
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);
    // assert (cookie + safe body)
    const body = response.body as { userId: number; email: string };

    expect(body.userId).toEqual(expect.any(Number));
    expect(body.email).toBe(credentials.email);
    expect(body).not.toHaveProperty('accessToken');
    expect(body).not.toHaveProperty('passwordHash');

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.startsWith('access_token='),
    );

    expect(accessTokenCookie).toBeDefined();
    expect(accessTokenCookie).toContain('HttpOnly');
  });

  it('should return the current authenticated user from /auth/me', async () => {
    // Arrange (create user)
    const credentials = {
      email: `e2e-${Date.now()}@jest-spec.com`,
      password: 'password',
    };
    createdEmails.push(credentials.email);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);
    const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
    // ACT
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookies)
      .expect(200);
    // ASSERT
    const body = response.body as {
      userId: number;
      email: string;
    };
    expect(body.email).toBe(credentials.email);
    expect(body.userId).toEqual(expect.any(Number));
  });
});
