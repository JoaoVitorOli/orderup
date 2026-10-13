import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersGateway } from './orders.gateway.js';

@Module({
  providers: [OrdersGateway, OrdersService],
})
export class OrdersModule {}
