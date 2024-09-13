import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Demo, DemoSchema } from '../schemas/demo.shema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Demo.name, schema: DemoSchema }],
      'mongodbConnection',
    ),
  ],
  //imports: [MongooseModule.forFeature([{name: 'Demo', schema: DemoSchema}], 'mongodbConnection')],
  controllers: [DemoController],
  providers: [DemoService],
  exports: [DemoService], // Export DemoService if needed in other modules
})
export class DemoModule {}
