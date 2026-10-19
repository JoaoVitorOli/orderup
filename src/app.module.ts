import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module.js';
import config from './mikro-orm.config.js';
import { MenuItemModule } from './menuItem/menu-item.module.js';
import { EnvConfigModule } from './shared/env-config/env-config.module.js';
import { minutes, seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RealtimeModule } from './realtime/realtime.module.js';

@Module({
  imports: [
    MikroOrmModule.forRoot(config), 
    MenuItemModule, 
    EnvConfigModule, 
    OrdersModule,
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: seconds(1), limit: 10 },
        { name: 'long', ttl: minutes(1), limit: 100 },
      ],
    }),
    RealtimeModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard  }
  ],
})
export class AppModule {}
