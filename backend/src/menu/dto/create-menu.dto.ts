import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên menu không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  displayOrder?: number = 0;
}
