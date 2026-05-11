import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplatesRepository: Repository<EmailTemplate>,
  ) {}

  findAllByUserId(userId: number): Promise<EmailTemplate[]> {
    return this.emailTemplatesRepository.find({
      where: {
        user: { userId },
      },
    });
  }

  findOneByUserId(
    emailTemplateId: number,
    userId: number,
  ): Promise<EmailTemplate> {
    return this.emailTemplatesRepository.findOneOrFail({
      where: {
        emailTemplateId,
        user: {
          userId,
        },
      },
      relations: {
        tags: true,
      },
    });
  }
}
