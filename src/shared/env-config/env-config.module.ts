import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfigService } from './env-config.service.js';
import { envSchema } from './env.schema.js';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ validationSchema: envSchema })],
  providers: [EnvConfigService],
  exports: [EnvConfigService],
})
export class EnvConfigModule {}