import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
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
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { UpdateApplicationDto } from './dto/update-application.dto';

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

  @ApiNoContentResponse({ description: 'Application updated successfully' })
  @ApiBadRequestResponse({
    description: 'Invalid application payload or id parameter',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiNotFoundResponse({
    description: 'Application not found for authenticated user',
  })
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) applicationId: number,
    @Body() dto: UpdateApplicationDto,
  ): Promise<void> {
    await this.applicationsService.patch({ userId, applicationId, dto });
  }

  @ApiNoContentResponse({ description: 'Application deleted successfully' })
  @ApiBadRequestResponse({ description: 'Invalid application id parameter' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiNotFoundResponse({
    description: 'Application not found for authenticated user',
  })
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) applicationId: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    await this.applicationsService.delete({ userId, applicationId });
  }
}
