import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config(); // una sola vez, arriba

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('LinkUp API')
    .setDescription('Backend de LinkUp con NestJS y PostgreSQL')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(
    `🚀 Servidor corriendo en http://localhost:${process.env.PORT || 3000}`,
  );
}

// Elige una:
void bootstrap();
// o:
// bootstrap().catch((err) => {
//   console.error('❌ Error al iniciar la app:', err);
//   process.exit(1);
// });
