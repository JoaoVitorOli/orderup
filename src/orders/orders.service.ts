import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import { EntityManager, FilterQuery } from '@mikro-orm/postgresql';
import { IOrder, OrderSchema } from './entities/order.entity.js';
import { MenuItemSchema } from '../menuItem/entities/menu-item.entity.js';
import { OrderItemSchema } from './entities/order-item.entity.js';
import type { GetOrderStatusDto } from './dto/get-order-status.dts.js';
import {type  GetAllOrderDto } from './dto/get-all-orders.dto.js';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

type OrderStatus = UpdateOrderStatusDto['status'];

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: ['PREPARING'],
  PREPARING: ['READY'],
  READY: [],
};

@Injectable()
export class OrdersService {
  constructor(private readonly orm: EntityManager) {}

  async create(createOrderDto: CreateOrderDto) {
    const existing = await this.orm.findOne(OrderSchema, 
      { idempotencyKey: createOrderDto.idempotencyKey },
      { populate: ['items'] }
    );

    if (existing) return existing;

    const requested = new Map<string, number>();

    for (const { menuItemId, quantity } of createOrderDto.items) {
      requested.set(menuItemId, (requested.get(menuItemId) ?? 0) + quantity);
    }

    const menuItems = await this.orm.find(MenuItemSchema, {
      id: { $in: [...requested.keys()] },
    });

    if (menuItems.length !== requested.size) {
      throw new NotFoundException('Some menu items do not exist');
    }

    for (const menuItem of menuItems) {
      const wanted = requested.get(menuItem.id)!;
      if (menuItem.quantity < wanted) {
        throw new ConflictException(`Not enough "${menuItem.name}" in stock`);
      }
    }

    const order = this.orm.create(OrderSchema, {
      customerName: createOrderDto.customerName,
      idempotencyKey: createOrderDto.idempotencyKey,
      total: 0,
    })

    for (const menuItem of menuItems) {
      const wanted = requested.get(menuItem.id)!;

      menuItem.quantity -= wanted;

      this.orm.create(OrderItemSchema, {
        order,
        menuItem,
        quantity: wanted,
        unitPrice: menuItem.price
      });

      order.total += menuItem.price * wanted;
    }

    await this.orm.flush();
    return order;
  }

  async getById(id: GetOrderStatusDto) {
    const order = await this.orm.findOne(OrderSchema, { id });
    
    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order;
  }

  async getAllOrders(query?: GetAllOrderDto) {
    const where: FilterQuery<IOrder> = {};

    if (query?.status?.length) {
      where.status = { $in: query.status };
    }

    return this.orm.find(OrderSchema, where, {
      orderBy: { createdAt: 'asc' },
      populate: ['items.menuItem'],
    });
  }

  async updateStatus(id: GetOrderStatusDto, { status }: UpdateOrderStatusDto) {
    const order = await this.getById(id);

    const currentStatus = order.status as OrderStatus;

    if (currentStatus === status) return order;

    if (!allowedTransitions[currentStatus].includes(status)) {
      throw new ConflictException(`Cannot change order status from ${currentStatus} to ${status}`);
    }

    order.status = status;
    await this.orm.flush();
    return order;
  }
}
