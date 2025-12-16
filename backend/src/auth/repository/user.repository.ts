import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getAll() {
    return await this.userRepo.findAndCount({
      where: { role: In(['owner', 'user']) },
    });
  }

  async block(user_id: number) {
    return await this.userRepo.update({ id: user_id }, { isActive: false });
  }

  async active(user_id: number) {
    return await this.userRepo.update({ id: user_id }, { isActive: true });
  }

  async findById(user_id: number) {
    return await this.userRepo.findOneBy({ id: user_id });
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async updateUser(user: User, data: Partial<User>) {
    Object.assign(user, data);
    await this.userRepo.save(user);
    const newUser = {
      displayName: user.displayName,
      contactPhone: user.contactPhone,
      email: user.email,
      avaUrl: user.avaUrl,
    };
    return newUser;
  }

  async findUserByFacebookType(username: string) {
    return await this.userRepo.findOne({
      where: {
        type: 'FACEBOOK',
        username: username,
      },
    });
  }

  async findUserByGoogleType(username: string) {
    return await this.userRepo.findOne({
      where: {
        type: 'GOOGLE',
        username: username,
      },
    });
  }

  async createUserByFacebookType(username: string, displayName: string) {
    const newUser = await this.userRepo.create({
      type: 'FACEBOOK',
      username: username,
      displayName: displayName,
      facebookId: username,
    });
    this.userRepo.save(newUser);
    return newUser;
  }
  async createUserByGoogleType(
    username: string,
    displayName: string,
    avaUrl: string,
  ) {
    const newUser = await this.userRepo.create({
      type: 'GOOGLE',
      username: username,
      displayName: displayName,
      avaUrl: avaUrl,
    });
    this.userRepo.save(newUser);
    return newUser;
  }
  async createUser(user: Partial<User>) {
    const newUser = this.userRepo.create(user);
    if (newUser.role == 'owner') {
      newUser.isActive = false;
    }
    return await this.userRepo.save(newUser);
  }
}
