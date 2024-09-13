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
  ) {
    // const list:any= {name:'asif', age:3};
    // this.logger.info(list)
    // this.logger.info([1,2,4,5])
    // this.logger.info("mixed obj", list)
    // this.logger.info("NO META")
    // this.logger.info("NO META", "asif", 9, "Ist")
    // this.logger.info("hello asif", {name:'asif', age:3})
    // this.logger.info("asif3 list ", [1,23,4]);
    // this.logger.info("asif3 list ", [1,23,{name:'asif'},'sdas']);
    // this.logger.info("asif3 list ", [1,23,{name:'asif'},'sdas'], [1,23,{name:'asif'},'sdas'], {name:'asif', age:3},  "ASIFSISS");
  }

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
      msg: message.value?.toString(),
      partition: partition.toString(),
      topic: topic.toString(),
    };
    this.logger.info(logMessage);
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
    this.logger.info(`Waiting for ${ms / 1000} seconds`);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
