import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module.js';
import config from './mikro-orm.config.js';
import { MenuItemModule } from './menuItem/menu-item.module.js';
import { MenuItemService } from './menuItem/menu-item.service.js';
import { MenuItemGateway } from './menuItem/menu-item.gateway.js';

@Module({
  imports: [MikroOrmModule.forRoot(config), MenuItemModule, OrdersModule],
  controllers: [],
  providers: [MenuItemService, MenuItemGateway],
})
export class AppModule {}
