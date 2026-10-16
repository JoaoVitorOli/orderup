import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe.js';
import { createOrderSchema, type CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';
import { getOrderStatusSchema, type GetOrderStatusDto } from './dto/get-order-status.dts.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createOrderSchema)) createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get(':id')
  async getStatusById(@Param('id', new ZodValidationPipe(getOrderStatusSchema)) getOrderStatusDto: GetOrderStatusDto) {
    return this.ordersService.getById(getOrderStatusDto);
  }
}
