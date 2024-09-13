import { Injectable } from '@nestjs/common';
import { WinstonModuleOptions } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import {
  createLogger,
  transports,
  format,
  Logger as WinstonLogger,
} from 'winston';
const { combine, timestamp, printf, label } = format;

@Injectable()
export class LoggerService {
  private readonly logger: WinstonLogger;

  constructor(private readonly configService: ConfigService) {
    this.logger = createLogger(this.createWinstonLoggerOptions());
  }

  private createWinstonLoggerOptions(): WinstonModuleOptions {
    const customFormat = printf(({ level, label, message, timestamp }) => {
      return `${timestamp} ${label} [${level}]: ${message}`;
    });

    return {
      level: this.configService.get<string>('LOG_LEVEL', 'info'),
      format: combine(
        label({ label: this.configService.get<string>('SERVICE_NAME', 'NESTAPP') }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat,
      ),
      transports: [
        new transports.File({
          filename: this.configService.get<string>(
            'LOG_FILE_PATH',
            '/var/log/aheevaccs/any-api-connector/nest-app.log',
          ),
        }),
        new transports.Console({
          format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
        }),
      ],
    };
  }

  public error(msg: any, ...meta: any[]) {
    this.logger.error(
      `${this.getFormatedMetaStr([msg])} ${this.getFormatedMetaStr(meta)}`,
    );
  }

  public warn(msg: any, ...meta: any[]) {
    this.logger.warn(
      `${this.getFormatedMetaStr([msg])} ${this.getFormatedMetaStr(meta)}`,
    );
  }

  public info(msg: any, ...meta: any[]) {
    this.logger.info(
      `${this.getFormatedMetaStr([msg])} ${this.getFormatedMetaStr(meta)}`,
    );
  }

  public verbose(msg: any, ...meta: any[]) {
    this.logger.verbose(
      `${this.getFormatedMetaStr([msg])} ${this.getFormatedMetaStr(meta)}`,
    );
  }

  public debug(msg: any, ...meta: any[]) {
    this.logger.debug(
      `${this.getFormatedMetaStr([msg])} ${this.getFormatedMetaStr(meta)}`,
    );
  }

  private getFormatedMetaStr(meta: any[]): String {
    if (!meta || meta.length === 0) return '';
    return meta
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : item))
      .join(' || ');
  }
}
