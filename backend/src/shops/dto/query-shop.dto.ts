import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsString,
  IsNumber,
  IsLongitude,
  IsLatitude,
} from 'class-validator';

export class QueryShopDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'reject', 'block'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsNumber()
  @IsLongitude()
  @Type(() => Number)
  longitude: number;

  @IsNumber()
  @IsLatitude()
  @Type(() => Number)
  latitude: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  @Type(() => Number)
  radius?: number;
}
