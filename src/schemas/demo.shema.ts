import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DemoDocument = HydratedDocument<Demo>;

@Schema()
export class Demo {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const DemoSchema = SchemaFactory.createForClass(Demo);
