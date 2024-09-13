import { Module } from '@nestjs/common';
import { DemoConsumer } from './demo.consumer';

@Module({
  providers: [DemoConsumer],
})
export class ConsumersModule {}
