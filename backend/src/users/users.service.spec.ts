import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const repo = {
    findOneOrFail: jest.fn(),
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
});
