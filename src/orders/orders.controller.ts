import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe.js';
import { createOrderSchema, type CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createOrderSchema)) createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }
}
