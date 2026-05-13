import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call events from service', async () => {
      // MOCK
      const result = [{ id: 1 }, { id: 2 }];
      service.findAll.mockResolvedValue(result);
      // CALL
      const resp = await controller.findAll();
      //CHECK
      expect(resp).toEqual(result);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should call event from service with id', async () => {
      // MOCK
      const id = 1;
      const result = { id };
      service.findOne.mockResolvedValue(result);
      // CALL
      const resp = await controller.findOne(id);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });
});
