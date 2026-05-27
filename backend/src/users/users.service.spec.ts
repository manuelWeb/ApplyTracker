import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const repo = {
    findOneOrFail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(repo as any);
  });

  describe('findOne', () => {
    it('should call repository.findOneOrFail with userId', async () => {
      await service.findOne(1);
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('should call repository.findOneOrFail with email', async () => {
      await service.findByEmail('user@jest.com');
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: {
          email: 'user@jest.com',
        },
      });
    });
  });

  describe('create', () => {
    it('should create and persist (save) a user', async () => {
      const email = 'user@jest.com';
      const passwordHash = 'hashed-password';

      const createdUser = {
        email,
        passwordHash,
      };

      const savedUser = {
        userId: 6,
        ...createdUser,
      };

      repo.create.mockReturnValue(createdUser);
      repo.save.mockResolvedValue(savedUser);

      const resp = await service.create(email, passwordHash);

      expect(repo.create).toHaveBeenCalledWith(createdUser);
      expect(repo.save).toHaveBeenCalledWith(createdUser);
      expect(resp).toEqual(savedUser);
    });
  });
});
