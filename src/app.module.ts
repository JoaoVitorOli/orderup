import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module.js';
import config from './mikro-orm.config.js';
import { MenuItemModule } from './menuItem/menu-item.module.js';
import { EnvConfigModule } from './shared/env-config/env-config.module.js';

@Module({
  imports: [
    MikroOrmModule.forRoot(config), 
    MenuItemModule, 
    EnvConfigModule, 
    OrdersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
