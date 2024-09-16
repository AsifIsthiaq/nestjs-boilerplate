import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongodbService } from 'src/mongodb/mongodb.service';
import { Demo, DemoSchema } from 'src/schemas/demo.shema';

@Injectable()
export class DemoDaoService {
  constructor(private readonly mongodbService: MongodbService) {}

  private getModel(dbName: string): Model<Demo> {
    return this.mongodbService
      .getMongoose()
      .connection.useDb(dbName)
      .model(Demo.name, DemoSchema);
  }

  async save(dbName: string, data: Partial<Demo>) {
    try {
      const model = this.getModel(dbName);
      const demo = new model(data);
      await demo.save();
      const demoData: any = { ...demo.toObject() };
      delete demoData['__v'];
      return demoData;
    } catch (error) {
      throw error;
    }
  }

  async update(dbName: string, demoId: string, data: Partial<Demo>) {
    try {
      const model = this.getModel(dbName);
      const demo = await model.findByIdAndUpdate(demoId, data, {
        new: true,
      });
      if (demo) {
        const demoData: any = { ...demo.toObject() };
        delete demoData['__v'];
        return demoData;
      }
      return demo;
    } catch (error) {
      throw error;
    }
  }

  async getAll(dbName: string) {
    try {
      const model = this.getModel(dbName);
      const query = {};
      const demos = await model.find(query).select('-__v');
      return demos;
    } catch (error) {
      throw error;
    }
  }

  async get(dbName: string, demoId: string) {
    try {
      const model = this.getModel(dbName);
      const demo = await model.findById(demoId).select('-__v');
      if (!demo) throw new NotFoundException('Not found in DB');
      return demo.toObject();
    } catch (error) {
      throw error;
    }
  }

  async delete(dbName: string, demoId: string) {
    try {
      const model = this.getModel(dbName);
      await model.findByIdAndDelete(demoId);
      return { message: 'DELETE_SUCCESSFUL' };
    } catch (error) {
      throw error;
    }
  }
}
