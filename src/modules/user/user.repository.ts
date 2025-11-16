import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '@/database/entities/user.entity';
import { BaseRepository } from '@/database/repositories/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
    constructor(dataSource: DataSource) {
        super(dataSource, User);
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({ where: { email } });
    }

    /**
     * Find user by identity ID and provider
     */
    async findByIdentityIdAndProvider(
        identityId: string,
        provider: string,
    ): Promise<User | null> {
        return await this.repository.findOne({
            where: { identityId, provider },
        });
    }

    /**
     * Override update method to return updated entity
     */
    async update(id: string, userData: Partial<User>): Promise<User | null> {
        await this.repository.update(id, userData);
        return await this.findById(id);
    }
}
