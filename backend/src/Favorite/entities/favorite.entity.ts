import { User } from 'src/auth/entities/user.entity';
import { Shops } from 'src/shops/entities/shops.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('favorites')
@Unique(['user', 'shop'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Shops, (shop) => shop.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shops;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
