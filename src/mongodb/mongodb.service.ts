// mongo-connection.service.ts
import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mongoose } from 'mongoose';
import { MongodbError } from 'src/error-handling/mongodb.error';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class MongodbService implements OnModuleInit, OnApplicationShutdown {
  private mongoose: Mongoose;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    await this.connectToDatabase();
    this.logger.info(`Successfully connected to Mongodb`);
  }

  private async connectToDatabase() {
    const mongodbUri = this.configService.get<string>('MONGODB_URI');
    if (!mongodbUri) {
      this.logger.error('MONGODB_URI environment variable is not defined');
      throw new MongodbError('MONGODB_URI environment variable is not defined');
    }
    try {
      if (!this.mongoose) {
        this.mongoose = new Mongoose();
        await this.mongoose.connect(mongodbUri);
      }
    } catch (error) {
      this.logger.error('Error connecting to Mongodb', error);
      throw new MongodbError('Error connecting to Mongodb');
    }
  }

  public getMongoose(): Mongoose {
    return this.mongoose;
  }

  async onApplicationShutdown() {
    try {
      if (this.mongoose) {
        await this.mongoose.disconnect();
      }
      this.logger.info('Successfully disconnected Mongodb');
    } catch (error) {
      this.logger.error('Error disconnecting Mongodb', error);
    }
  }
}
