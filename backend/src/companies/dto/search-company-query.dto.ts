import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SearchCompaniesQueryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  search!: string;
}
