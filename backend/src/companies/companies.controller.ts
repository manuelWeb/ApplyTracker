import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CurrentUserId } from '@/auth/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { toCompanyResponseDto } from './mappers/company-response.mapper';
import { CompanyResponseDto } from './dto/response-company.dto';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @ApiCreatedResponse({ type: CompanyResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiConflictResponse({ description: 'Company already exists' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateCompanyDto,
    @CurrentUserId() currentUserId: number,
  ): Promise<CompanyResponseDto> {
    const company = await this.companiesService.create(dto, currentUserId);
    return toCompanyResponseDto(company);
  }

  // Company catalog entries are append-only in V1.
  // Update/delete service primitives stay unexposed until catalog governance
  // rules are defined (creator permissions, verification, usage checks, merge flow).
}
