import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;

  const repo = {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new EventsService(repo as any);
  });

  describe('findAll', () => {
    it('should call repository.findAll without options', async () => {
      await service.findAll();
      expect(repo.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should call repository.findOne with eventId', async () => {
      await service.findOne(1);
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: { eventId: 1 },
      });
    });
  });
});
