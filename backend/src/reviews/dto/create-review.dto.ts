import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1, { message: 'Rating phải từ 1 đến 5' })
  @Max(5, { message: 'Rating phải từ 1 đến 5' })
  rating: number;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung đánh giá không được để trống' })
  comment: string;
}

export class ReplyReviewDto {
  @IsString()
  @IsNotEmpty({ message: 'Nội dung phản hồi không được để trống' })
  ownerReply: string;
}

import { Type } from 'class-transformer';

export class QueryReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number;
}
