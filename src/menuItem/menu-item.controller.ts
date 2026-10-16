import * as createMenuItemDto from './dtos/create-menu-item.dto.js';
import { MenuItemService } from './menu-item.service.js';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe.js';
import { createMenuItemSchema } from './dtos/create-menu-item.dto.js';
import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import * as deleteMenuItemDto from './dtos/delete-menu-item.dto.js';

@Controller('menu')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post('')
  async create(@Body(new ZodValidationPipe(createMenuItemSchema)) createMenuItemDto: createMenuItemDto.CreateMenuItemDto) {
    return this.menuItemService.create(createMenuItemDto);
  }

  @Delete(':id')
  async delete(@Param('id', new ZodValidationPipe(deleteMenuItemDto.deleteMenuItemSchema)) id: deleteMenuItemDto.DeleteMenuItemDto) {
    return this.menuItemService.delete(id);
  }
}
