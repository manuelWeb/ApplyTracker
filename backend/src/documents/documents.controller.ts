import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':userId')
  findAllByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.documentsService.findAllByUserId(userId);
  }

  @Get(':documentId/user/:userId')
  findOneByUserId(
    @Param('documentId', ParseIntPipe) documentId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.documentsService.findOneByUserId(documentId, userId);
  }
}
