import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { RedisDB } from 'src/enums/redis-db.enum';
import { RedisError } from 'src/error-handling/redis.error';
import { LoggerService } from 'src/logger/logger.service';

export interface IRedisOperation {
  // String operations
  set(key: string, value: string, db?: RedisDB): Promise<void>;
  get(key: string, db?: RedisDB): Promise<string | null>;

  // List operations
  lPush(key: string, value: string, db?: RedisDB): Promise<number>;
  rPush(key: string, value: string, db?: RedisDB): Promise<number>;
  lPop(key: string, db?: RedisDB): Promise<string | null>;
  rPop(key: string, db?: RedisDB): Promise<string | null>;

  // Set operations
  sAdd(key: string, value: string, db?: RedisDB): Promise<number>;
  sMembers(key: string, db?: RedisDB): Promise<string[]>;

  // Hash operations
  hSet(key: string, field: string, value: string, db?: RedisDB): Promise<void>;
  hGet(key: string, field: string, db?: RedisDB): Promise<string | undefined>;
  hDel(key: string, field: string, db?: RedisDB): Promise<number>;

  // Key operations
  keys(pattern: string, db?: RedisDB): Promise<string[]>;
  del(key: string, db?: RedisDB): Promise<number>;

  // Generic operations
  exists(key: string, db?: RedisDB): Promise<number>;
  expire(key: string, ttl: number, db?: RedisDB): Promise<boolean>;
}

@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown, IRedisOperation {
  private clients: Map<RedisDB, RedisClientType> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    await this.initializeClients();
    this.logger.info(`Successfully connected to Redis`);
  }

  private async initializeClients() {
    const redisUri = this.configService.get<string>('REDIS_URI');
    if (!redisUri) {
      this.logger.error('REDIS_URI environment variable is not defined');
      throw new RedisError('REDIS_URI environment variable is not defined');
    }
    const redisDbCount = Object.keys(RedisDB).length / 2;
    try {
      for (let dbIndex = 0; dbIndex <= redisDbCount; dbIndex++) {
        const client: RedisClientType = createClient({
          url: `${redisUri}?${dbIndex}`,
        });
        await client.connect();
        client.select(dbIndex);
        this.clients.set(dbIndex, client);
        this.logger.debug(`Connected to Redis DB ${dbIndex}`);
      }
    } catch (error) {
      this.logger.error('Error initializing Redis clients', error);
      throw new RedisError('Error initializing Redis clients');
    }
  }

  private getClient(db: RedisDB): RedisClientType | undefined {
    return this.clients.get(db);
  }

  // String operations
  async set(
    key: string,
    value: string,
    db: RedisDB = RedisDB.DB0,
  ): Promise<void> {
    const client = this.getClient(db);
    if (client) {
      await client.set(key, value);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  async get(key: string, db: RedisDB = RedisDB.DB0): Promise<string | null> {
    const client = this.getClient(db);
    if (client) {
      return await client.get(key);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  // List operations
  async lPush(
    key: string,
    value: string,
    db: RedisDB = RedisDB.DB0,
  ): Promise<number> {
    const client = this.getClient(db);
    if (client) {
      return await client.lPush(key, value);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  async rPush(
    key: string,
    value: string,
    db: RedisDB = RedisDB.DB0,
  ): Promise<number> {
    const client = this.getClient(db);
    if (client) {
      return await client.rPush(key, value);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  async lPop(key: string, db: RedisDB = RedisDB.DB0): Promise<string | null> {
    const client = this.getClient(db);
    if (client) {
      return await client.lPop(key);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  async rPop(key: string, db: RedisDB = RedisDB.DB0): Promise<string | null> {
    const client = this.getClient(db);
    if (client) {
      return await client.rPop(key);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  // Set operations
  async sAdd(
    key: string,
    value: string,
    db: RedisDB = RedisDB.DB0,
  ): Promise<number> {
    const client = this.getClient(db);
    if (client) {
      return await client.sAdd(key, value);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  async sMembers(key: string, db: RedisDB = RedisDB.DB0): Promise<string[]> {
    const client = this.getClient(db);
    if (client) {
      return await client.sMembers(key);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  // Hash operations
  async hSet(
    key: string,
    field: string,
    value: string,
    db: RedisDB = RedisDB.DB0,
  ): Promise<void> {
    const client = this.getClient(db);
    if (client) {
      await client.hSet(key, field, value);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  async hGet(
    key: string,
    field: string,
    db: RedisDB = RedisDB.DB0,
  ): Promise<string | undefined> {
    const client = this.getClient(db);
    if (client) {
      return await client.hGet(key, field);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  async hDel(
    key: string,
    field: string,
    db: RedisDB = RedisDB.DB0,
  ): Promise<number> {
    const client = this.getClient(db);
    if (client) {
      return await client.hDel(key, field);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  // Key operations
  async keys(pattern: string, db: RedisDB = RedisDB.DB0): Promise<string[]> {
    const client = this.getClient(db);
    if (client) {
      return await client.keys(pattern);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  async del(key: string, db: RedisDB = RedisDB.DB0): Promise<number> {
    const client = this.getClient(db);
    if (client) {
      return await client.del(key);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  // Generic operations
  async exists(key: string, db: RedisDB = RedisDB.DB0): Promise<number> {
    const client = this.getClient(db);
    if (client) {
      return await client.exists(key);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  async expire(
    key: string,
    ttl: number,
    db: RedisDB = RedisDB.DB0,
  ): Promise<boolean> {
    const client = this.getClient(db);
    if (client) {
      return await client.expire(key, ttl);
    } else {
      throw new RedisError(`No Redis client found for DB ${db}`);
    }
  }

  async onApplicationShutdown() {
    for (const [key, client] of this.clients.entries()) {
      try {
        await client.quit();
        this.logger.info(`Disconnected from Redis DB ${key}`);
      } catch (error) {
        this.logger.error(`Error disconnecting from Redis DB ${key}:`, error);
      }
    }
  }
}
