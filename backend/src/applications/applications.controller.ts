import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUserId } from '@/auth/decorators/current-user-id.decorator';
import { CreateApplicationDto } from './dto/create-application.dto';
import { toApplicationResponseDto } from './mappers/application-response.mapper';
import { ApplicationResponseDto } from './dto/application.response.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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

  @ApiCreatedResponse({ type: () => ApplicationResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid application payload' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiNotFoundResponse({
    description: 'Related user, company, contract or status not found',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateApplicationDto,
    @CurrentUserId() userId: number,
  ): Promise<ApplicationResponseDto> {
    const application = await this.applicationsService.create(dto, userId);
    return toApplicationResponseDto(application);
  }
}
