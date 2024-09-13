import { Global, Module } from '@nestjs/common';
import { DemoDaoService } from './demo-dao.service';

@Global()
@Module({
  providers: [DemoDaoService],
  exports: [DemoDaoService],
})
export class DaoModule {}
