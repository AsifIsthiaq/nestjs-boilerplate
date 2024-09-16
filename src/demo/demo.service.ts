import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectConnection } from '@nestjs/mongoose';
import { Demo } from '../schemas/demo.shema';
import { CreateDemoDto } from '../dto/create-demo.dto';
import { RedisService } from 'src/redis/redis.service';
import { RedisDB } from 'src/enums/redis-db.enum';
import { KafkaService } from 'src/kafka/kafka.service';
import { DEMO_PRODUCER_TOPIC } from 'src/constants/kafka.constants';
import { LoggerService } from 'src/logger/logger.service';
import { DemoDaoService } from 'src/dao/demo-dao.service';

@Injectable()
export class DemoService {
  constructor(
    // @InjectConnection('mongodbConnection')
    // private readonly connection: Connection,
    private readonly redisService: RedisService,
    private readonly kafkaService: KafkaService,
    private readonly logger: LoggerService,
    private readonly demoDaoService: DemoDaoService,
  ) {}

  async findAll(dbName: string): Promise<Demo[]> {
    // const model = this.getModelForDb(dbName);
    // const demos = await model.find().exec();
    return await this.demoDaoService.getAll(dbName);
  }

  async findById(dbName: string, id: string): Promise<Demo | null> {
    // const model = this.getModelForDb(dbName);
    // const demo = await model.findById(id).exec();
    // if (!demo) throw new NotFoundException('Not found in DB');
    return await this.demoDaoService.get(dbName, id);
  }

  async create(dbName: string, demoData: Partial<Demo>): Promise<Demo> {
    // const model = this.getModelForDb(dbName);
    // const demo = new model(demoData);
    return await this.demoDaoService.save(dbName, demoData);
  }

  //redis-test
  async getData(): Promise<string | null> {
    // const value = await this.cacheManager.get<string>('nestjsRedisKey'); // ? Retrieve data from the cache
    // return value;
    // handle error
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
    this.logger.info('publishing');
    const dataToPublish = JSON.stringify({
      data: 'this is emplotyee create: ' + Math.floor(Math.random() * 101),
    });
    await this.kafkaService.produce({
      topic: DEMO_PRODUCER_TOPIC,
      messages: [
        {
          key: 'kafkakey',
          value: dataToPublish,
        },
      ],
    });
  }
}
