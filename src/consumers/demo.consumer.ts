import { Injectable, OnModuleInit } from '@nestjs/common';
import { Consumer } from 'kafkajs';
import {
  DEMO_CONSUMER_GROUPID,
  DEMO_CONSUMER_TOPICS,
} from 'src/constants/kafka.constants';
import { KafkaError } from 'src/error-handling/kafka.error';
import { KafkaService } from 'src/kafka/kafka.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class DemoConsumer implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    try {
      const consumer: Consumer = await this.initializeConsumer();
      this.runConsumer(consumer);
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
          this.handleKafkaMessage(consumer, topic, partition, message);
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      this.logger.error('Error while running Kafka consumer');
    }
  }

  private async handleKafkaMessage(
    consumer: Consumer,
    topic: string,
    partition: number,
    message: any,
  ) {
    try {
      await this.processMessage(topic, partition, message);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      this.logger.error(
        `Error while processing message from Kafka Topic: ${topic}, ${message.key?.toString() ? 'Key: ' + message.key?.toString() : ''} || Message: `,
        message.value?.toString(),
      );
    }

    try {
      await this.commitOffsets(consumer, topic, partition, message.offset);
    } catch (error) {
      this.logger.error(
        `Failed to commit offset for topic: ${topic}, partition: ${partition}, ${message.key?.toString() ? 'Key: ' + message.key?.toString() : ''}`,
        error,
      );
    }
  }

  private async processMessage(
    topic: string,
    partition: number,
    message: any,
  ): Promise<void> {
    const parsedMsg: any = this.parseKafkaMessage(message);
    this.logger.info(
      `Message from Kafka[topic: ${topic}, partition:${partition}, offset:${message.offset}]: `,
      {
        key: message.key?.toString(),
        value: parsedMsg,
        headers: message.headers,
      },
    );
    await this.delay(3000);
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
      this.logger.info(
        `Committed offset ${(Number(offset) + 1).toString()} for topic: ${topic}, partition: ${partition}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new KafkaError(
        `Error committing offset for topic: ${topic}, partition: ${partition}`,
      );
    }
  }

  parseKafkaMessage(message: any): any {
    let parsedValue: any;
    const messageValue = message.value?.toString();
    try {
      parsedValue = JSON.parse(messageValue);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      parsedValue = messageValue;
    }
    this.logger.debug('Parsed Kafka Message:', parsedValue);
    return parsedValue;
  }

  private async delay(ms: number): Promise<void> {
    this.logger.info(`Waiting for ${ms / 1000} seconds`);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
