import * as createMenuItemDto from './dtos/create-menu-item.dto.js';
import { MenuItemService } from './menu-item.service.js';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe.js';
import { createMenuItemSchema } from './dtos/create-menu-item.dto.js';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('menu')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post('')
  async create(@Body(new ZodValidationPipe(createMenuItemSchema)) createMenuItemDto: createMenuItemDto.CreateMenuItemDto) {
    return this.menuItemService.create(createMenuItemDto);
  }
}
