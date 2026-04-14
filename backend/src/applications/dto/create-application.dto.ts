import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  MinLength,
} from 'class-validator';
import { ApplicationStatus } from '../application.entity';

export class CreateApplicationDto {
  @IsString()
  @MinLength(1)
  position: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  appliedDate?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;
}
