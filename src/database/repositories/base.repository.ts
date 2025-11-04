import { Injectable } from '@nestjs/common';
import { DataSource, EntityTarget, FindOptionsWhere, ObjectLiteral, QueryRunner, Repository } from 'typeorm';

/**
 * Base Repository with transaction support
 * All repositories should extend this class to get common CRUD operations and transaction helpers
 */
@Injectable()
export abstract class BaseRepository<Entity extends ObjectLiteral> {
    protected repository: Repository<Entity>;

    constructor(
        protected readonly dataSource: DataSource,
        private readonly entityClass: EntityTarget<Entity>,
    ) {
        this.repository = this.dataSource.getRepository(entityClass);
    }

    /**
     * Find all entities
     */
    async findAll(): Promise<Entity[]> {
        return await this.repository.find();
    }

    /**
     * Find one entity by ID
     */
    async findById(id: string | number): Promise<Entity | null> {
        return await this.repository.findOne({ where: { id } as any });
    }

    /**
     * Find one entity by conditions
     */
    async findOne(where: FindOptionsWhere<Entity>): Promise<Entity | null> {
        return await this.repository.findOne({ where });
    }

    /**
     * Find entities by conditions
     */
    async findBy(where: FindOptionsWhere<Entity>): Promise<Entity[]> {
        return await this.repository.findBy(where);
    }

    /**
     * Create and save entity
     */
    async create(data: Partial<Entity>): Promise<Entity> {
        const entity = this.repository.create(data as any);
        return await this.repository.save(entity) as any;
    }

    /**
     * Update entity by ID
     */
    async update(id: string | number, data: Partial<Entity>): Promise<Entity | null> {
        await this.repository.update(id, data as any);
        return await this.findById(id);
    }

    /**
     * Delete entity by ID
     */
    async delete(id: string | number): Promise<number> {
        const result = await this.repository.delete(id);
        return result.affected ?? 0;
    }

    /**
     * Check if entity exists by ID
     */
    async exists(id: string | number): Promise<boolean> {
        const count = await this.repository.count({ where: { id } as any });
        return count > 0;
    }

    /**
     * Check if entity exists by conditions
     */
    async existsBy(where: FindOptionsWhere<Entity>): Promise<boolean> {
        const count = await this.repository.countBy(where);
        return count > 0;
    }

    /**
     * Count all entities
     */
    async count(): Promise<number> {
        return await this.repository.count();
    }

    /**
     * Count entities by conditions
     */
    async countBy(where: FindOptionsWhere<Entity>): Promise<number> {
        return await this.repository.countBy(where);
    }

    // ==================== TRANSACTION METHODS ====================

    /**
     * Execute multiple operations in a transaction
     * Auto commits if successful, auto rollbacks if error
     * 
     * @example
     * await repository.withTransaction(async (queryRunner) => {
     *     await queryRunner.manager.save(entity1);
     *     await queryRunner.manager.save(entity2);
     * });
     */
    async withTransaction<T>(
        callback: (queryRunner: QueryRunner) => Promise<T>,
    ): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await callback(queryRunner);
            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Create a new query runner for manual transaction control
     * Remember to release the query runner after use
     * 
     * @example
     * const queryRunner = await repository.createQueryRunner();
     * await queryRunner.startTransaction();
     * try {
     *     await queryRunner.manager.save(entity);
     *     await queryRunner.commitTransaction();
     * } catch (error) {
     *     await queryRunner.rollbackTransaction();
     * } finally {
     *     await queryRunner.release();
     * }
     */
    async createQueryRunner(): Promise<QueryRunner> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        return queryRunner;
    }

    /**
     * Save multiple entities in a transaction
     */
    async saveMany(entities: Entity[]): Promise<Entity[]> {
        return await this.withTransaction(async (queryRunner) => {
            return await queryRunner.manager.save(entities);
        });
    }

    /**
     * Create and save multiple entities in a transaction
     */
    async createMany(dataArray: Partial<Entity>[]): Promise<Entity[]> {
        return await this.withTransaction(async (queryRunner) => {
            const entities = dataArray.map(data => this.repository.create(data as any));
            return await queryRunner.manager.save(entities) as any;
        });
    }

    /**
     * Delete multiple entities by IDs in a transaction
     */
    async deleteMany(ids: (string | number)[]): Promise<number> {
        return await this.withTransaction(async (queryRunner) => {
            const result = await queryRunner.manager.delete(this.entityClass, ids);
            return result.affected ?? 0;
        });
    }

    /**
     * Execute raw SQL query within a transaction
     */
    async executeInTransaction(sql: string, parameters?: any[]): Promise<any> {
        return await this.withTransaction(async (queryRunner) => {
            return await queryRunner.query(sql, parameters);
        });
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get the TypeORM repository instance
     * Use this for advanced queries
     */
    getRepository(): Repository<Entity> {
        return this.repository;
    }

    /**
     * Get the DataSource instance
     */
    getDataSource(): DataSource {
        return this.dataSource;
    }

    /**
     * Create a query builder
     */
    createQueryBuilder(alias: string): any {
        return this.repository.createQueryBuilder(alias);
    }
}

