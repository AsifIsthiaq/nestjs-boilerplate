import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateDemoDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsInt()
  readonly age: number;

  @IsString()
  @IsOptional()
  readonly breed?: string;
}
