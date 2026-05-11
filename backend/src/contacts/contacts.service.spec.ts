import { ContactsService } from './contacts.service';

describe('ContactsService', () => {
  let service: ContactsService;

  const repo = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ContactsService(repo as any);
  });

  describe('findAll', () => {
    it('should call repository.findAll without options', async () => {
      await service.findAll();
      expect(repo.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should call repository.findOne with contactId and company relation', async () => {
      await service.findOne(1);
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: { contactId: 1 },
        relations: {
          company: true,
        },
      });
    });
  });
});
