import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateMenuItemDto } from './dtos/create-menu-item.dto.js';
import { EntityManager } from '@mikro-orm/postgresql';
import { MenuItemSchema } from './entities/menu-item.entity.js';
import type { DeleteMenuItemDto } from './dtos/delete-menu-item.dto.js';
import type { GetMenuItemDto } from './dtos/get-menu-item.dto.js';
import type { UpdateMenuItemDto } from './dtos/update-menu-item.dto.js';

@Injectable()
export class MenuItemService {
  constructor(private readonly orm: EntityManager) {}

  async create(createMenuItemDto: CreateMenuItemDto) {
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

  async delete(id: DeleteMenuItemDto) {
    const menuItem = await this.orm.findOne(MenuItemSchema, {
      id
    });

    if (!menuItem) {
      throw new NotFoundException('This menu item does not exists');
    }

    const item = this.orm.nativeDelete(MenuItemSchema, id);
    return item;
  }

  async getAll() {
    return this.orm.findAll(MenuItemSchema);
  }

  async getById(id: GetMenuItemDto) {
    const item = await this.orm.findOne(MenuItemSchema, id);

    if (!item) {
      throw new NotFoundException('This menu item does not exists');
    }

    return item;
  }

  async update(id: GetMenuItemDto, updateMenuItemDto: UpdateMenuItemDto) {
    const item = await this.getById(id);

    if (updateMenuItemDto.name && updateMenuItemDto.name !== item.name) {
      const nameInUse = await this.orm.findOne(MenuItemSchema, {
        name: updateMenuItemDto.name,
        id: { $ne: id },
      });

      if (nameInUse) {
        throw new ConflictException('An item with this exactly name already exists on menu list');
      }
    }

    this.orm.assign(item, updateMenuItemDto);
    await this.orm.flush();
    return item;
  }
}
