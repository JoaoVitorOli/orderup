import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe.js';
import { createOrderSchema, type CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';
import { getOrderStatusSchema, type GetOrderStatusDto } from './dto/get-order-status.dts.js';
import { getAllOrderSchema } from './dto/get-all-orders.dto.js';
import type { GetAllOrderDto } from './dto/get-all-orders.dto.js';
import { updateOrderStatusSchema, type UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { minutes, SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Throttle({ long: { limit: 10, ttl: minutes(1) } })
  @Post()
  async create(@Body(new ZodValidationPipe(createOrderSchema)) createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @SkipThrottle({ short: true })
  @Get()
  async getOrders(@Query(new ZodValidationPipe(getAllOrderSchema)) query?: GetAllOrderDto) {
    return this.ordersService.getAllOrders(query);
  }

  @Get(':id')
  async getStatusById(@Param('id', new ZodValidationPipe(getOrderStatusSchema)) getOrderStatusDto: GetOrderStatusDto) {
    return this.ordersService.getById(getOrderStatusDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', new ZodValidationPipe(getOrderStatusSchema)) id: GetOrderStatusDto,
    @Body(new ZodValidationPipe(updateOrderStatusSchema)) updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
