import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '@/tags/entities/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  findAll(): Promise<Tag[]> {
    return this.tagsRepository.find();
  }

  findOne(tagId: number): Promise<Tag> {
    return this.tagsRepository.findOneOrFail({
      where: { tagId },
      relations: {
        applications: true,
        emailTemplates: true,
        documents: true,
      },
    });
  }
}
