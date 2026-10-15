import { ConflictException, Injectable } from '@nestjs/common';
import * as createMenuItemDto from './dtos/create-menu-item.dto.js';
import { EntityManager } from '@mikro-orm/postgresql';
import { MenuItemSchema } from './entities/menu-item.entity.js';

@Injectable()
export class MenuItemService {
  constructor(private readonly orm: EntityManager) {}

  async create(createMenuItemDto: createMenuItemDto.CreateMenuItemDto) {
    const itemAlreadyExists = await this.orm.findOne(MenuItemSchema, {
      name: createMenuItemDto.name
    })

    if (itemAlreadyExists) {
      throw new ConflictException('An item with this exactly name already exists on menu list');
    }

    const item = this.orm.create(MenuItemSchema, createMenuItemDto);
    await this.orm.flush();
    return item;
  }
}
