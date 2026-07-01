import { CompanyResponseDto } from '../dto/response-company.dto';
import { Company } from '../entities/company.entity';

export function toCompanyResponseDto(company: Company): CompanyResponseDto {
  return {
    companyId: company.companyId,
    name: company.name,
    normalizedName: company.normalizedName,
    website: company.website ?? null,
    isVerified: company.isVerified,
  };
}
