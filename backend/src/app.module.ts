import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { typeOrmConfig } from './config/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationsModule } from './applications/applications.module';
import { ContractsModule } from './contracts/contracts.module';
import { StatusesModule } from './statuses/statuses.module';
import { TagsModule } from './tags/tags.module';
import { CompaniesModule } from './companies/companies.module';
import { ContactsModule } from './contacts/contacts.module';
import { EventsModule } from './events/events.module';
import { CommentsModule } from './comments/comments.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { DocumentsModule } from './documents/documents.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    //  config ORM for NestJS runtime
    TypeOrmModule.forRoot(typeOrmConfig),
    ApplicationsModule,
    ContractsModule,
    StatusesModule,
    TagsModule,
    CompaniesModule,
    ContactsModule,
    EventsModule,
    CommentsModule,
    EmailTemplatesModule,
    DocumentsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
