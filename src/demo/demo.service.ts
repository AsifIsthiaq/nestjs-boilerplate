import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Demo, DemoSchema } from '../schemas/demo.shema';
import { CreateDemoDto } from '../dto/create-demo.dto';
import { RedisService } from 'src/redis/redis.service';
import { RedisDB } from 'src/enums/redis-db.enum';
import { KafkaService } from 'src/kafka/kafka.service';
import { DEMO_PRODUCER_TOPIC } from 'src/constants/kafka.constants';

@Injectable()
export class DemoService {
  constructor(
    @InjectConnection('mongodbConnection')
    private readonly connection: Connection,
    private readonly redisService: RedisService,
    private readonly kafkaService: KafkaService,
  ) {}

  private getModelForDb(dbName: string): Model<Demo> {
    return this.connection.useDb(dbName).model(Demo.name, DemoSchema);
  }

  async findAll(dbName: string): Promise<Demo[]> {
    const model = this.getModelForDb(dbName);
    const demos = await model.find().exec();
    return demos;
  }

  async findById(dbName: string, id: string): Promise<Demo | null> {
    const model = this.getModelForDb(dbName);
    const demo = await model.findById(id).exec();
    if (!demo) throw new NotFoundException('Not found in DB');
    return demo;
  }

  async create(dbName: string, demoData: Partial<Demo>): Promise<Demo> {
    const model = this.getModelForDb(dbName);
    const demo = new model(demoData);
    return await demo.save();
  }

  //redis-test
  async getData(): Promise<string | null> {
    // const value = await this.cacheManager.get<string>('nestjsRedisKey'); // ? Retrieve data from the cache
    // return value;
    const value = await this.redisService.get('nestjsRedisKey', RedisDB.DB6);
    return value;
  }

  async postData(createDemoDto: CreateDemoDto) {
    const { name } = createDemoDto;
    await this.redisService.set('nestjsRedisKey', name, RedisDB.DB6);
    //await this.cacheManager.set('nestjsRedisKey', name); //  ? Set data in the cache
  }

  async deleteData() {
    //await this.cacheManager.del('nestjsRedisKey'); // ? Delete data from the cache
  }

  //kafka-test
  async publish() {
    console.log('create call');
    await this.kafkaService.produce({
      topic: DEMO_PRODUCER_TOPIC,
      messages: [
        {
          value: 'this is emplotyee create: ' + Math.floor(Math.random() * 101),
        },
      ],
    });
  }
}
