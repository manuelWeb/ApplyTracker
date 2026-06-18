import { ApplicationResponseDto } from '../dto/application.response.dto';
import { Application } from '../entities/application.entity';

export function toApplicationResponseDto(
  application: Application,
): ApplicationResponseDto {
  return {
    applicationId: application.applicationId,
    jobTitle: application.jobTitle,
    jobDomain: application.jobDomain ?? null,
    jobDescription: application.jobDescription ?? null,
    location: application.location ?? null,
    projectGoal: application.projectGoal ?? null,
    jobUrl: application.jobUrl ?? null,
    score: application.score,
    company: {
      companyId: application.company.companyId,
      name: application.company.name,
      website: application.company.website ?? null,
    },
    contract: {
      contractId: application.contract.contractId,
      name: application.contract.name,
    },
    status: {
      statusId: application.status.statusId,
      displayOrder: application.status.displayOrder,
      name: application.status.name,
    },
  };
}
