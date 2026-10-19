import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeGateway } from './realtime.gateway.js';
import { EnvConfigService } from '../shared/env-config/env-config.service.js';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        { provide: EnvConfigService, useValue: { get: vi.fn() } },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
