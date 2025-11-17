import { Bookings } from 'src/booking/entities/bookings.entity';
import { Shops } from 'src/shops/entities/shops.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('app_user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'LOCAL' })
  type: string;

  @Column()
  displayName: string;

  @Column()
  username: string;

  @Column({ default: '' })
  password: string;

  @Column({
    default:
      'https://jskadysbdihpzhmaaccv.supabase.co/storage/v1/object/public/image/default-avatar.jpg',
  })
  avaUrl: string;

  @Column({ default: '' })
  contactPhone: string;

  @Column({ default: '' })
  facebookId: string;

  @Column({ default: 'refresh_token' })
  refreshToken: string;

  @Column({ default: 'access_token' })
  accessToken: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Shops, (shop) => shop.owner)
  shops: Shops;

  @OneToMany(() => Bookings, (booking) => booking.user)
  bookings: Bookings[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
