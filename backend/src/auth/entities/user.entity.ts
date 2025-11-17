import {
  Column,
  CreateDateColumn,
  Entity,
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
