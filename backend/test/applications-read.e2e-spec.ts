import { AppModule } from '@/app.module';
import { User } from '@/users/entities/user.entity';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { App } from 'supertest/types';
import { In, Repository } from 'typeorm';
import request from 'supertest';
import { Application } from '@/applications/entities/application.entity';
import { Company } from '@/companies/entities/company.entity';
import { Contract } from '@/contracts/entities/contract.entity';
import { Status } from '@/statuses/entities/status.entity';
import { JwtService } from '@nestjs/jwt';

describe('Application read ownership (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;
  let applicationRepository: Repository<Application>;
  let companyRepository: Repository<Company>;
  let contractRepository: Repository<Contract>;
  let statusRepository: Repository<Status>;

  let createdApplicationIds: number[] = [];
  let createdCompanyIds: number[] = [];
  let createdContractIds: number[] = [];
  let createdStatusIds: number[] = [];
  let createdEmails: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    // in Nest test container give me User Repository
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    applicationRepository = moduleFixture.get<Repository<Application>>(
      getRepositoryToken(Application),
    );
    companyRepository = moduleFixture.get<Repository<Company>>(
      getRepositoryToken(Company),
    );
    contractRepository = moduleFixture.get<Repository<Contract>>(
      getRepositoryToken(Contract),
    );
    statusRepository = moduleFixture.get<Repository<Status>>(
      getRepositoryToken(Status),
    );

    await app.init();
  });

  afterEach(async () => {
    if (createdApplicationIds.length)
      await applicationRepository.delete({
        applicationId: In(createdApplicationIds),
      });
    createdApplicationIds = [];
    if (createdEmails.length)
      await userRepository.delete({ email: In(createdEmails) });
    createdEmails = [];
    if (createdCompanyIds.length)
      await companyRepository.delete({ companyId: In(createdCompanyIds) });
    createdCompanyIds = [];
    if (createdContractIds.length)
      await contractRepository.delete({ contractId: In(createdContractIds) });
    createdContractIds = [];
    if (createdStatusIds.length)
      await statusRepository.delete({ statusId: In(createdStatusIds) });
    createdStatusIds = [];
  });

  afterAll(async () => {
    await app.close();
  });
  /**
   * use cases to test
   *
   * # findAllFromUser
   * 1. should return 401 for unauthenticated user
   * 2. should return 401 for invalid/expired token
   * 3. should return an empty array when authenticated user owns no applications
   * 4. should return only the authenticated user's applications
   *
   * # findOneFromUser
   * 1. should return 401 for unauthenticated user
   * 2. should return 401 for invalid/expired token
   * 3. should return 404 when application id does not exist
   * 4. should return 404 when application exists but is owned by another user
   * 5. should return the application when owned by the authenticated user
   */

  it('should return 200 with empty applications array when authenticated user owns no applications on GET /applications', async () => {
    // Arrange
    const credentials = {
      email: `get-applications-${Date.now()}@jest-spec.fr`,
      password: 'superthin',
    };
    createdEmails.push(credentials.email);
    await request(app.getHttpServer()).post('/auth/register').send(credentials);
    // Act
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);
    const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
    const accessToken = cookies.find((cookie) =>
      cookie.startsWith('access_token'),
    );
    expect(accessToken).toBeDefined();
    const response = await request(app.getHttpServer())
      .get('/applications')
      .set('Cookie', cookies);
    // Assert (check)
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
  it('should return 200 with applications array belonging to the authenticated user on GET /applications', async () => {
    // Arrange
    const credentialsUserA = {
      email: `get-applications-user-A-${Date.now()}@jest-spec.fr`,
      password: 'oneApplication',
    };
    const credentialsUserB = {
      email: `get-applications-user-B-${Date.now()}@jest-spec.fr`,
      password: 'oneApplication',
    };
    createdEmails.push(
      credentialsUserA.email.trim().toLowerCase(),
      credentialsUserB.email.trim().toLowerCase(),
    );

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentialsUserA);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentialsUserB);

    const userA = await userRepository.findOneOrFail({
      where: { email: credentialsUserA.email.trim().toLowerCase() },
    });
    const userB = await userRepository.findOneOrFail({
      where: { email: credentialsUserB.email.trim().toLowerCase() },
    });

    const company: Company = await companyRepository.save({
      name: 'E2E Company',
      website: 'https://e2e.com',
    });
    createdCompanyIds.push(company.companyId);
    const contract: Contract = await contractRepository.save({
      name: 'CDI type e2e',
    });
    createdContractIds.push(contract.contractId);

    const maxStatus = await statusRepository
      .createQueryBuilder('status')
      .select('MAX(status.displayOrder)', 'max')
      .getRawOne<{ max: number | null } | undefined>();
    const nextDisplayOrder = (maxStatus?.max ?? 0) + 1;
    const status: Status = await statusRepository.save({
      displayOrder: nextDisplayOrder,
      name: `unique-status-name-${nextDisplayOrder}`,
    });
    createdStatusIds.push(status.statusId);
    const applicationA: Application = await applicationRepository.save({
      jobTitle: 'Application A',
      user: userA,
      company,
      contract,
      status,
    });
    createdApplicationIds.push(applicationA.applicationId);
    const applicationB: Application = await applicationRepository.save({
      jobTitle: 'Application B',
      user: userB,
      company,
      contract,
      status,
    });
    createdApplicationIds.push(applicationB.applicationId);

    // Act
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentialsUserA)
      .expect(200);
    const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
    const accessToken = cookies.find((cookie) =>
      cookie.startsWith('access_token'),
    );
    expect(accessToken).toBeDefined();
    const response = await request(app.getHttpServer())
      .get('/applications')
      .set('Cookie', cookies);
    const applications = response.body as Application[];
    // Assert (check)
    expect(response.status).toBe(200);
    expect(applications).toHaveLength(1);
    expect(applications[0].applicationId).toBe(applicationA.applicationId);
    expect(applications[0].applicationId).not.toBe(applicationB.applicationId);
  });
  it('should return 401 for unauthenticated request on GET /applications', async () => {
    // Arrange (empty because no auth req)
    // Act
    const response = await request(app.getHttpServer()).get('/applications');
    // Assert (certify)
    expect(response.status).toBe(401);
  });
  it('should return 401 when jwt token is expired or invalid on GET /applications', async () => {
    // Arrange (invalid token)
    const invalidToken = 'invalid.jwt.token';
    // Act
    const response = await request(app.getHttpServer())
      .get('/applications')
      .set('Cookie', [`access_token=${invalidToken}`]);
    // Assert
    expect(response.status).toBe(401);
    expect((response.body as { message: string }).message).toBe(
      'invalid token',
    );
    // Arrange (expired token)
    const jwtService = app.get(JwtService);
    const expiredJwt = jwtService.sign(
      {
        sub: 999999,
        email: 'test-application-expired-token@jest-e2e.com',
      },
      {
        expiresIn: -1,
      },
    );
    // Act
    const expiredRes = await request(app.getHttpServer())
      .get('/applications')
      .set('Cookie', [`access_token=${expiredJwt}`]);
    // Assert
    expect(expiredRes.status).toBe(401);
    expect((expiredRes.body as { message: string }).message).toBe(
      'jwt expired',
    );
  });

  it('should return 200 with ONE application belonging to the authenticated user on GET /applications/:id', async () => {
    // Arrange
    const credentials = {
      email: `test-application-id-${Date.now()}@jest-e2e.com`,
      password: 'password',
    };
    createdEmails.push(credentials.email);
    await request(app.getHttpServer()).post('/auth/register').send(credentials);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials);
    expect(login.status).toBe(200);
    const cookies = login.headers['set-cookie'] as unknown as string[];
    const accessToken = cookies.find((cookie) =>
      cookie.startsWith('access_token'),
    );
    expect(accessToken).toBeDefined();
    const user = await userRepository.findOneOrFail({
      where: { email: credentials.email },
    });
    const company: Company = await companyRepository.save({ name: 'Amazon' });
    createdCompanyIds.push(company.companyId);
    const contract: Contract = await contractRepository.save({ name: 'CDD' });
    createdContractIds.push(contract.contractId);
    const maxStatus = await statusRepository
      .createQueryBuilder('status')
      .select('MAX(status.displayOrder)', 'max')
      .getRawOne<{ max: number | null } | undefined>();
    const nextDisplayOrder = (maxStatus?.max ?? 0) + 1;
    const status: Status = await statusRepository.save({
      displayOrder: nextDisplayOrder,
      name: `status-${nextDisplayOrder}`,
    });
    createdStatusIds.push(status.statusId);
    const application: Application = await applicationRepository.save({
      jobTitle: 'DevOps',
      user,
      company,
      contract,
      status,
    });
    createdApplicationIds.push(application.applicationId);
    // Act
    const response = await request(app.getHttpServer())
      .get(`/applications/${application.applicationId}`)
      .set('Cookie', cookies);
    // Assert
    expect(response.status).toBe(200);
    expect((response.body as Application).applicationId).toBe(
      application.applicationId,
    );
    expect((response.body as Application).jobTitle).toBe(application.jobTitle);
  });
  it('should return 401 for unauthenticated request on GET /applications/:id', async () => {
    // Arrange
    const applicationId = 1;
    // Act
    const response = await request(app.getHttpServer()).get(
      `/applications/${applicationId}`,
    );
    // Assert (certify)
    expect(response.status).toBe(401);
  });
  it('should return 401 when jwt token is invalid on GET /applications/:id', async () => {
    // Arrange (invalid token)
    const applicationId = 1;
    const invalidToken = 'invalid.jwt.token';
    // Act
    const response = await request(app.getHttpServer())
      .get(`/applications/${applicationId}`)
      .set('Cookie', [`access_token=${invalidToken}`]);
    // Assert
    expect(response.status).toBe(401);
    expect((response.body as { message: string }).message).toBe(
      'invalid token',
    );
  });
  it('should return 401 when jwt token is expired on GET /applications/:id', async () => {
    // Arrange (expired token)
    const applicationId = 1;
    const jwtService = app.get(JwtService);
    const expiredJwt = jwtService.sign(
      {
        sub: 999999,
        email: 'test-application-expired-token@jest-e2e.com',
      },
      {
        expiresIn: -1,
      },
    );
    // Act
    const expiredRes = await request(app.getHttpServer())
      .get(`/applications/${applicationId}`)
      .set('Cookie', [`access_token=${expiredJwt}`]);
    // Assert
    expect(expiredRes.status).toBe(401);
    expect((expiredRes.body as { message: string }).message).toBe(
      'jwt expired',
    );
  });
  it('should return 404 when application exist but is owned by another user on GET /applications/:id', async () => {
    // Arrange
    const credentialsUserA = {
      email: `get-applications-user-A-${Date.now()}@jest-spec.fr`,
      password: 'oneApplication',
    };
    const credentialsUserB = {
      email: `get-applications-user-B-${Date.now()}@jest-spec.fr`,
      password: 'oneApplication',
    };
    createdEmails.push(
      credentialsUserA.email.trim().toLowerCase(),
      credentialsUserB.email.trim().toLowerCase(),
    );

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentialsUserA);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentialsUserB);

    const userA = await userRepository.findOneOrFail({
      where: { email: credentialsUserA.email.trim().toLowerCase() },
    });
    const userB = await userRepository.findOneOrFail({
      where: { email: credentialsUserB.email.trim().toLowerCase() },
    });

    const company: Company = await companyRepository.save({
      name: 'E2E Company',
      website: 'https://e2e.com',
    });
    createdCompanyIds.push(company.companyId);
    const contract: Contract = await contractRepository.save({
      name: 'CDI type e2e',
    });
    createdContractIds.push(contract.contractId);

    const maxStatus = await statusRepository
      .createQueryBuilder('status')
      .select('MAX(status.displayOrder)', 'max')
      .getRawOne<{ max: number | null } | undefined>();
    const nextDisplayOrder = (maxStatus?.max ?? 0) + 1;
    const status: Status = await statusRepository.save({
      displayOrder: nextDisplayOrder,
      name: `unique-status-name-${nextDisplayOrder}`,
    });
    createdStatusIds.push(status.statusId);
    const applicationA: Application = await applicationRepository.save({
      jobTitle: 'Application A',
      user: userA,
      company,
      contract,
      status,
    });
    createdApplicationIds.push(applicationA.applicationId);
    const applicationB: Application = await applicationRepository.save({
      jobTitle: 'Application B',
      user: userB,
      company,
      contract,
      status,
    });
    createdApplicationIds.push(applicationB.applicationId);
    // Act
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentialsUserA)
      .expect(200);
    const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
    const accessToken = cookies.find((cookie) =>
      cookie.startsWith('access_token'),
    );
    expect(accessToken).toBeDefined();
    const response = await request(app.getHttpServer())
      .get(`/applications/${applicationB.applicationId}`)
      .set('Cookie', cookies);
    const notFoundBody = response.body as { error: string };
    // Assert (check)
    expect(response.status).toBe(404);
    expect(notFoundBody.error).toBe('Not Found');
  });
  it('should return 404 when application id does not exist for authenticated user on GET /applications/:id', async () => {
    // Arrange
    const credentials = {
      email: `get-application-by-id-${Date.now()}@jest-spec.fr`,
      password: 'password',
    };
    createdEmails.push(credentials.email);
    await request(app.getHttpServer()).post('/auth/register').send(credentials);
    // Act
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);
    const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
    const accessToken = cookies.find((cookie) =>
      cookie.startsWith('access_token'),
    );
    expect(accessToken).toBeDefined();
    const response = await request(app.getHttpServer())
      .get('/applications/1')
      .set('Cookie', cookies);
    // Assert (check)
    expect(response.status).toBe(404);
  });
});
