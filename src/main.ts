import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { EnvConfigService } from './shared/env-config/env-config.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const env = app.get(EnvConfigService);

  app.enableCors({
    origin: env.get('CORS_ORIGINS'),
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400,
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
