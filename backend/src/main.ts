import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
// @ts-ignore - Type issues with @fastify/cookie
import cookie from '@fastify/cookie';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({ logger: true });

  // Register cookie plugin on the Fastify instance before creating NestJS app
  // @ts-ignore - Type issues with @fastify/cookie
  await fastifyAdapter.register(cookie, {
    secret: process.env.JWT_SECRET || 'your-secret-key', // for cookies integrity
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix(configService.get('API_PREFIX') || 'api/v1');

  const port = configService.get('PORT') || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API available at: http://localhost:${port}/${configService.get('API_PREFIX')}`);
}

bootstrap();
