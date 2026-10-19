import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { EnvConfigService } from '../env-config/env-config.service.js';
import { safeEqual } from '../helpers/safe-equal.js';

@Injectable()
export class KitchenKeyGuard implements CanActivate {
  constructor(private readonly env: EnvConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.header('x-kitchen-key');

    if (!key || !safeEqual(key, this.env.get('KITCHEN_API_KEY'))) {
      throw new UnauthorizedException('Invalid kitchen key');
    }

    return true;
  }
}
