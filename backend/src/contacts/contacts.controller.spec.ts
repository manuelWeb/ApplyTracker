import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

describe('ContactsController', () => {
  let controller: ContactsController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call contacts from service', async () => {
      // MOCK
      const result = [{ id: 3 }, { id: 8 }];
      service.findAll.mockResolvedValue(result);
      // CALL
      const resp = await controller.findAll();
      // CHECK
      expect(resp).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should call contact from service with param id', async () => {
      // MOCK
      const id = 2;
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
