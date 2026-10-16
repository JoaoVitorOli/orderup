import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import { EntityManager } from '@mikro-orm/postgresql';
import { OrderSchema } from './entities/order.entity.js';
import { MenuItemSchema } from '../menuItem/entities/menu-item.entity.js';
import { OrderItemSchema } from './entities/order-item.entity.js';
import type { GetOrderStatusDto } from './dto/get-order-status.dts.js';

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
}
