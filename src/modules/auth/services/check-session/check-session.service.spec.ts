import { Test, TestingModule } from '@nestjs/testing';
import { CheckSessionService } from './check-session.service';

describe('CheckSessionService', () => {
  let service: CheckSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckSessionService],
    }).compile();

    service = module.get<CheckSessionService>(CheckSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
