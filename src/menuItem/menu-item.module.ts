import { Module } from '@nestjs/common';
import { MenuItemController } from './menu-item.controller.js';
import { MenuItemService } from './menu-item.service.js';

@Module({
  controllers: [MenuItemController],
  providers: [MenuItemService],
})
export class MenuItemModule {}
