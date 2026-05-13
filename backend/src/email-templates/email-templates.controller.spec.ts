import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplatesController } from './email-templates.controller';
import { EmailTemplatesService } from './email-templates.service';

describe('EmailTemplatesController', () => {
  let controller: EmailTemplatesController;

  const service = {
    findAllByUserId: jest.fn(),
    findOneByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailTemplatesController],
      providers: [
        {
          provide: EmailTemplatesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<EmailTemplatesController>(EmailTemplatesController);
    jest.clearAllMocks();
  });

  describe('findAllByUserId', () => {
    it('should call email-templates from service with Param userId', async () => {
      // MOCK
      const userId = 1;
      const result = { userId };
      service.findAllByUserId.mockResolvedValue(result);
      // CALL
      const resp = await controller.findAllByUserId(userId);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findAllByUserId).toHaveBeenCalledTimes(1);
      expect(service.findAllByUserId).toHaveBeenCalledWith(userId);
    });
  });
  describe('findOneByUserId', () => {
    it('should call email-template from service with params emailTemplateId, userId', async () => {
      // MOCK
      const emailTemplateId = 3;
      const userId = 6;
      const result = { emailTemplateId, userId };
      service.findOneByUserId.mockResolvedValue(result);
      // CALL
      const resp = await controller.findOneByUserId(emailTemplateId, userId);
      // CHECK
      expect(resp).toEqual(result);
      expect(service.findOneByUserId).toHaveBeenCalledTimes(1);
      expect(service.findOneByUserId).toHaveBeenCalledWith(
        emailTemplateId,
        userId,
      );
    });
  });
});
