import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';

@Controller('email-templates')
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Get(':userId')
  findAllByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.emailTemplatesService.findAllByUserId(userId);
  }

  @Get(':emailTemplateId/user/:userId')
  findOneByUserId(
    @Param('emailTemplateId', ParseIntPipe) emailTemplateId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.emailTemplatesService.findOneByUserId(emailTemplateId, userId);
  }
}
