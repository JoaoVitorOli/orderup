import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SkipThrottle } from '@nestjs/throttler';
import type { Server, Socket } from 'socket.io';
import type { IOrder } from '../orders/entities/order.entity.js';
import { ROOMS, WS_EVENTS } from './realtime.events.js';
import { WsZodValidationPipe } from '../shared/pipes/ws-zod-validation.pipe.js';
import type { OrderSubscribeDto } from './dto/order-subscribe.dto.js';
import { orderSubscribeSchema } from './dto/order-subscribe.dto.js';

@SkipThrottle({ short: true, long: true })
@WebSocketGateway()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  private server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(WS_EVENTS.KITCHEN_SUBSCRIBE)
  async subscribeKitchen(@ConnectedSocket() client: Socket) {
    await client.join(ROOMS.KITCHEN);
    return { ok: true };
  }

  emitOrderCreated(order: IOrder) {
    this.server.to(ROOMS.KITCHEN).emit(WS_EVENTS.ORDER_CREATED, order);
  }

  emitOrderStatusUpdated(order: IOrder) {
    this.server
      .to(ROOMS.KITCHEN)
      .to(ROOMS.order(order.id))
      .emit(WS_EVENTS.ORDER_STATUS_UPDATED, order);
  }

  @SubscribeMessage(WS_EVENTS.ORDER_SUBSCRIBE)
  async subscribeOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsZodValidationPipe(orderSubscribeSchema)) { orderId }: OrderSubscribeDto,
  ) {
    await client.join(ROOMS.order(orderId));
    return { ok: true };
  }
}