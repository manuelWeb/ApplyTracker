import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty()
  companyId!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  website!: string | null;
}
export class ContractResponseDto {
  @ApiProperty()
  contractId!: number;

  @ApiProperty()
  name!: string;
}
export class StatusResponseDto {
  @ApiProperty()
  statusId!: number;

  @ApiProperty()
  displayOrder!: number;

  @ApiProperty()
  name!: string;
}

export class ApplicationResponseDto {
  @ApiProperty()
  applicationId!: number;

  @ApiProperty()
  jobTitle!: string;

  @ApiPropertyOptional({ nullable: true })
  jobDomain!: string | null;

  @ApiPropertyOptional({ nullable: true })
  location!: string | null;

  @ApiPropertyOptional({ nullable: true })
  projectGoal!: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobDescription!: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobUrl!: string | null;

  @ApiProperty()
  score!: number;

  @ApiProperty({ type: () => CompanyResponseDto })
  company!: CompanyResponseDto;
  @ApiProperty({ type: () => ContractResponseDto })
  contract!: ContractResponseDto;
  @ApiProperty({ type: () => StatusResponseDto })
  status!: StatusResponseDto;
}
