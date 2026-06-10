import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUserId } from '@/auth/decorators/current-user-id.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllFromUser(@CurrentUserId() userId: number) {
    return this.applicationsService.findAllFromUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOneFromUser(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicationsService.findOneFromUser(userId, id);
  }
}
