import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@/database/entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) {}

    async findAll(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    async findOne(id: string): Promise<User | null> {
        return await this.userRepository.findById(id);
    }

    async create(createUserDto: Partial<User>): Promise<User> {
        return await this.userRepository.create(createUserDto);
    }

    async update(id: string, updateUserDto: Partial<User>): Promise<User | null> {
        const exists = await this.userRepository.exists(id);
        if (!exists) {
            throw new NotFoundException('User not found');
        }
        return (await this.userRepository.update(id, updateUserDto)) ?? null;
    }

    async remove(id: string): Promise<void> {
        const affected = await this.userRepository.delete(id);
        if (affected === 0) {
            throw new NotFoundException('User not found');
        }
    }
}
