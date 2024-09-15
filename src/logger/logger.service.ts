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
import 'winston-daily-rotate-file';

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
    const serviceName = this.configService.get<string>(
      'SERVICE_NAME',
      'NESTAPP',
    );
    const logFilePath = `${this.configService.get<string>(
      'LOG_FILE_PATH',
      'log',
    )}/${serviceName}`;

    return {
      level: this.configService.get<string>('LOG_LEVEL', 'info'),
      format: combine(
        label({
          label: serviceName,
        }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat,
      ),
      transports: [
        new transports.DailyRotateFile({
          filename: `${logFilePath}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: '100m', // Max log file size before rotating
          maxFiles: this.configService.get<string>('LOG_FILE_MAX_LIMIT', '5'),
          createSymlink: true, // Creates a symlink for the most recent log
          symlinkName: `${serviceName}.log`, // Symlink name for current log
          format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
        }),
        new transports.Console({
          format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
        }),
        // new transports.File({
        //   filename: logFilePath+'.log',
        // }),
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
