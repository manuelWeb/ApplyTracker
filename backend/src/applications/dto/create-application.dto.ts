import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  jobUrl?: string;

  @IsOptional()
  @IsInt()
  score?: number;

  @IsInt()
  companyId!: number;

  @IsInt()
  contractId!: number;

  @IsInt()
  statusId!: number;
}
