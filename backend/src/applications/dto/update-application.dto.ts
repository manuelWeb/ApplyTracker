import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateApplicationDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  jobDomain?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  projectGoal?: string;

  @IsOptional()
  @IsString()
  jobDescription?: string;

  @IsOptional()
  @IsString()
  jobUrl?: string;

  @IsOptional()
  @IsInt()
  score?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  companyId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  contractId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  statusId?: number;
}
