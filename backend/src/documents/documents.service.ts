import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
  ) {}

  findAllByUserId(userId: number): Promise<Document[]> {
    return this.documentsRepository.find({
      where: {
        user: { userId },
      },
    });
  }

  findOneByUserId(documentId: number, userId: number): Promise<Document> {
    return this.documentsRepository.findOneOrFail({
      where: {
        documentId,
        user: {
          userId,
        },
      },
      relations: {
        tags: true,
        applications: true,
      },
    });
  }
}
