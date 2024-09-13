import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Consumer } from 'kafkajs';
import {
  DEMO_CONSUMER_GROUPID,
  DEMO_CONSUMER_TOPICS,
} from 'src/constants/kafka.constants';
import { KafkaError } from 'src/error-handling/kafka.error';
import { KafkaService } from 'src/kafka/kafka.service';

@Injectable()
export class DemoConsumer implements OnModuleInit {
  private readonly logger = new Logger(DemoConsumer.name);

  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    try {
      const consumer: Consumer = await this.initializeConsumer();
      await this.runConsumer(consumer);
    } catch (error) {
      this.logger.error(
        `Unable to setup Kafka consumer for topics: ${DEMO_CONSUMER_TOPICS}`,
        error,
      );
    }
  }

  private async initializeConsumer(): Promise<Consumer> {
    return await this.kafkaService.getConsumer(DEMO_CONSUMER_GROUPID, {
      topics: DEMO_CONSUMER_TOPICS.split(','),
    });
  }

  private async runConsumer(consumer: Consumer): Promise<void> {
    try {
      await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message }) => {
          await this.processMessage(topic, partition, message);
          await this.delay(2000);
          await this.commitOffsets(consumer, topic, partition, message.offset);
        },
      });
    } catch (error) {
      throw new KafkaError('Error while running Kafka consumer');
    }
  }

  private async processMessage(
    topic: string,
    partition: number,
    message: any,
  ): Promise<void> {
    const logMessage = {
      source: 'demo-consumer',
      message: message.value?.toString(),
      partition: partition.toString(),
      topic: topic.toString(),
    };
    this.logger.log(logMessage);
  }

  private async commitOffsets(
    consumer: Consumer,
    topic: string,
    partition: number,
    offset: string,
  ): Promise<void> {
    try {
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(offset) + 1).toString(),
        },
      ]);
      this.logger.log(
        `Committed offset ${(Number(offset) + 1).toString()} for topic: ${topic}, partition: ${partition}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to commit offset for topic: ${topic}, partition: ${partition}`,
        error,
      );
      throw new KafkaError(
        `Error committing offset for topic: ${topic}, partition: ${partition}`,
      );
    }
  }

  private async delay(ms: number): Promise<void> {
    this.logger.log(`Waiting for ${ms / 1000} seconds`);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
