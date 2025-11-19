import { User } from 'src/auth/entities/user.entity';
import { Shops } from 'src/shops/entities/shops.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: 'Rating từ 1-5' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column('text', { array: true, default: [] })
  img: string[];

  @Column({ type: 'text', nullable: true, default: null })
  ownerReply: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  repliedAt: Date | null;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Shops, (shop) => shop.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shops;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
