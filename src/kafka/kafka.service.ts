import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Consumer,
  ConsumerSubscribeTopics,
  Kafka,
  Producer,
  ProducerRecord,
} from 'kafkajs';
import { KafkaError } from 'src/error-handling/kafka.error';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class KafkaService implements OnModuleInit, OnApplicationShutdown {
  private kafka: Kafka;
  private producer: Producer;
  private readonly consumers: Consumer[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    this.kafka = this.getKafka();
    await this.connectProducer();
  }

  getKafka(): Kafka {
    const brokers = this.configService.get<string>('KAFKA_BROKERS');
    const username = this.configService.get<string>('KAFKA_USERNAME');
    const password = this.configService.get<string>('KAFKA_PASSWORD');
    if (!brokers || !username || !password) {
      this.logger.error('Kafka environment variables are not properly defined');
      throw new KafkaError(
        'Kafka environment variables are not properly defined',
      );
    }

    return new Kafka({
      brokers: brokers.split(','),
      ssl: false,
      sasl: {
        mechanism: 'plain',
        username,
        password,
      },
    });
  }

  async connectProducer() {
    try {
      this.producer = this.kafka.producer();
      await this.producer.connect();
      this.logger.info('Successfully connected to Kafka producer');
    } catch (error) {
      this.logger.error('Error connecting to Kafka producer', error);
      throw new KafkaError('Error connecting to Kafka producer');
    }
  }

  async produce(record: ProducerRecord): Promise<void> {
    try {
      await this.producer.send(record);
    } catch (error) {
      throw new KafkaError('Unable to send message to Kafka');
    }
  }

  async getConsumer(
    groupId: string,
    topics: ConsumerSubscribeTopics,
  ): Promise<Consumer> {
    try {
      const consumer: Consumer = this.kafka.consumer({ groupId });
      consumer.connect();
      consumer.subscribe(topics);
      this.consumers.push(consumer);
      this.logger.info(
        'Successfully connected to Kafka consumer',
        groupId,
        topics,
      );
      return consumer;
    } catch (error) {
      throw new KafkaError('Unable to connect to Kafka consumer');
    }
  }

  async onApplicationShutdown() {
    try {
      await this.producer?.disconnect();
      for (const consumer of this.consumers) {
        await consumer.disconnect();
      }
      this.logger.info('Successfully disconnected Kafka');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka', error);
    }
  }
}
