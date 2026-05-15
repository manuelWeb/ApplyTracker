import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('ApplyTracker API')
    .setDescription('ApplyTracker backend API documentation')
    .setVersion('0.0.1')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(
      `Server is running on port ${process.env.PORT ?? 3000} Docker api exposed port ${process.env.API_HOST_PORT ?? 3008}`,
    );
  });
}
bootstrap();
