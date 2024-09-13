import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DemoService } from './demo.service';
import { Demo } from '../schemas/demo.shema';
import { CreateDemoDto } from '../dto/create-demo.dto';
import { LoggerService } from 'src/logger/logger.service';

@Controller('v1/demo')
export class DemoController {
  constructor(
    private readonly demoService: DemoService,
    private readonly logger: LoggerService,
  ) {}

  @Get('findAll')
  async findAll(@Query('dbName') dbName: string): Promise<Demo[]> {
    if (!dbName) {
      throw new Error('Database name is required');
    }
    return this.demoService.findAll(dbName);
  }

  @Post('create')
  async create(
    @Body() demoData: CreateDemoDto,
    @Query('dbName') dbName: string,
  ): Promise<Demo> {
    if (!dbName) {
      throw new Error('Database name is required');
    }
    return this.demoService.create(dbName, demoData);
  }

  // redis-test
  @Get('redis')
  async getData() {
    try {
      return await this.demoService.getData();
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }
  @Post('redis')
  async postData(@Body() createDemoDto: CreateDemoDto) {
    try {
      return await this.demoService.postData(createDemoDto);
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  @Delete('redis')
  async deleteData() {
    try {
      return await this.demoService.deleteData();
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  @Get('kafka')
  async publish() {
    try {
      return await this.demoService.publish();
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('dbName') dbName: string,
  ): Promise<Demo | null> {
    if (!dbName) {
      throw new Error('Database name is required');
    }
    return this.demoService.findById(dbName, id);
  }
}
