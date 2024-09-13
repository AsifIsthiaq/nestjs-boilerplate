import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DemoModule } from './demo/demo.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';
import { KafkaModule } from './kafka/kafka.module';
import { ConsumersModule } from './consumers/consumers.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      (() => {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
          throw new Error('MONGODB_URI environment variable is not defined');
        }
        return mongoUri;
      })(),
      { connectionName: 'mongodbConnection' },
    ),
    RedisModule,
    KafkaModule,
    DemoModule,
    ConsumersModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
