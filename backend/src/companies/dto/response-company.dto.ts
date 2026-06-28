import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty()
  companyId!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  normalizedName!: string;

  @ApiPropertyOptional()
  website?: string | null;

  @ApiProperty()
  isVerified!: boolean;
}
