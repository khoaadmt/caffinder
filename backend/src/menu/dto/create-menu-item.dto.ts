import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên món không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Giá phải lớn hơn 0' })
  price: number;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  img?: string[];

  @IsString()
  @IsOptional()
  category?: string;

  @IsOptional()
  @Min(0)
  displayOrder?: number = 0;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
