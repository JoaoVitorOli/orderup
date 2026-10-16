import { MenuItemService } from './menu-item.service.js';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe.js';
import { createMenuItemSchema, type CreateMenuItemDto } from './dtos/create-menu-item.dto.js';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { deleteMenuItemSchema, type DeleteMenuItemDto } from './dtos/delete-menu-item.dto.js';
import { getMenuItemSchema, type GetMenuItemDto } from './dtos/get-menu-item.dto.js';
import { updateMenuItemSchema, type UpdateMenuItemDto } from './dtos/update-menu-item.dto.js';

@Controller('menu')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createMenuItemSchema)) createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemService.create(createMenuItemDto);
  }

  @Get()
  async getMenu() {
    return this.menuItemService.getAll();
  }
  
  @Get(':id')
  async getMenuItem(@Param('id', new ZodValidationPipe(getMenuItemSchema)) id: GetMenuItemDto) {
    return this.menuItemService.getById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', new ZodValidationPipe(getMenuItemSchema)) id: GetMenuItemDto,
    @Body(new ZodValidationPipe(updateMenuItemSchema)) updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemService.update(id, updateMenuItemDto);
  }

  @Delete(':id')
  async delete(@Param('id', new ZodValidationPipe(deleteMenuItemSchema)) id: DeleteMenuItemDto) {
    return this.menuItemService.delete(id);
  }
}
