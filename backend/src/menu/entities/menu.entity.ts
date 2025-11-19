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
import { Shops } from 'src/shops/entities/shops.entity';
import { MenuItem } from './menu-item.entity';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  displayOrder: number;

  @ManyToOne(() => Shops, (shop) => shop.menus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shops;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.menu)
  items: MenuItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
