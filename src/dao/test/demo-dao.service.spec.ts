import { Test, TestingModule } from '@nestjs/testing';
import { DemoDaoService } from '../demo-dao.service';

describe('DemoDaoService', () => {
  let service: DemoDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemoDaoService],
    }).compile();

    service = module.get<DemoDaoService>(DemoDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
