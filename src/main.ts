import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvService } from './shared/env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();

  const docsConfig = new DocumentBuilder()
    .setTitle('Desafio Técnico Konsi')
    .setDescription('API para consulta de benefícios do INSS')
    .setVersion('1.0')
    .build();
  const docsFactory = () => SwaggerModule.createDocument(app, docsConfig);
  SwaggerModule.setup('docs', app, docsFactory());

  const envService = app.get(EnvService);
  await app.listen(envService.get('PORT'));
}
void bootstrap();
