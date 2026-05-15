// Configuration used by AppModule / Nest
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { Company } from '@/companies/entities/company.entity';
import { Contract } from '@/contracts/entities/contract.entity';
import { Status } from '@/statuses/entities/status.entity';
import { Tag } from '@/tags/entities/tag.entity';
import { EmailTemplate } from '@/email-templates/entities/email-template.entity';
import { Document } from '@/documents/entities/document.entity';
import { Application } from '@/applications/entities/application.entity';
import { Comment } from '@/comments/entities/comment.entity';
import { Event } from '@/events/entities/event.entity';
import { Contact } from '@/contacts/entities/contact.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',

  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_CONTAINER_PORT),

  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  entities: [
    Application,
    User,
    Company,
    Contract,
    Status,
    Tag,
    EmailTemplate,
    Document,
    Comment,
    Event,
    Contact,
  ],

  synchronize: false,
};
