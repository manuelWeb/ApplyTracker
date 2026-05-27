import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

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
  @IsUrl()
  jobUrl?: string;

  @IsOptional()
  @IsInt()
  score?: number;

  @IsInt()
  @IsPositive()
  companyId!: number;

  @IsPositive()
  @IsInt()
  contractId!: number;

  @IsPositive()
  @IsInt()
  statusId!: number;
}
