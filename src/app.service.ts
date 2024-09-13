import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {}

  getHealthStatus(): any {
    return {
      success: true,
      message: 'Any-Api-Connector service is up and running',
    };
  }
}
