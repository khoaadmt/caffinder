import { User } from 'src/auth/entities/user.entity';
import { Bookings } from 'src/booking/entities/bookings.entity';
import { Favorite } from 'src/Favorite/entities/favorite.entity';
import { Review } from 'src/reviews/entities/review.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shops')
export class Shops {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { array: true })
  img: string[];

  @Column()
  address: string;

  @Column()
  description: string;

  @Column()
  totalCapacity: number;

  @Column({ default: 60 })
  defaultDuration: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.15 })
  overbookingRate: number; // 1.15 = 115%

  @Column({ type: 'time' })
  openTime: string;

  @Column({ type: 'time' })
  closeTime: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({
    type: 'enum',
    enum: ['reject', 'pending', 'approved', 'block'],
    default: 'pending',
  })
  status: string;

  // Owner relation
  @ManyToOne(() => User, (user) => user.shops)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => Bookings, (booking) => booking.shop)
  bookings: Bookings[];

  @OneToMany(() => Favorite, (favorite) => favorite.shop)
  favorites: Favorite[];

  @OneToMany(() => Review, (review) => review.shop)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
