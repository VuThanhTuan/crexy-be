# Base Repository Pattern with Transaction Support

## Overview

`BaseRepository` là một abstract class cung cấp các phương thức CRUD cơ bản và transaction helpers cho tất cả repositories trong ứng dụng.

## Features

✅ **Generic CRUD Operations** - Các phương thức cơ bản cho mọi entity
✅ **Transaction Support** - Auto commit/rollback transactions
✅ **Type-Safe** - Generic type support với TypeScript
✅ **Reusable** - DRY principle, không lặp lại code
✅ **Flexible** - Có thể override methods cho custom logic

## Architecture

```
BaseRepository (Abstract)
    ↓
ProductRepository extends BaseRepository<Product>
UserRepository extends BaseRepository<User>
CategoryRepository extends BaseRepository<Category>
...
```

## Usage

### 1. Create a Repository

```typescript
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/database/repositories/base.repository';
import { Product } from '@/database/entities/product.entity';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
    constructor(dataSource: DataSource) {
        super(dataSource, Product);
    }

    // Add custom methods here
    async findByCategory(categoryId: string): Promise<Product[]> {
        return await this.repository.find({ 
            where: { categoryId } 
        });
    }

    // Override base methods if needed
    async findById(id: string): Promise<Product | null> {
        return await this.repository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.id = :id', { id })
            .getOne();
    }
}
```

### 2. Register in Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/database/entities/product.entity';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';

@Module({
    imports: [TypeOrmModule.forFeature([Product])],
    providers: [ProductRepository, ProductService],
    exports: [ProductService, ProductRepository],
})
export class ProductModule {}
```

### 3. Use in Service

```typescript
import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
    constructor(private readonly productRepository: ProductRepository) {}

    async getAll() {
        return await this.productRepository.findAll();
    }

    async getById(id: string) {
        return await this.productRepository.findById(id);
    }

    async create(data: CreateProductDto) {
        return await this.productRepository.create(data);
    }
}
```

## Available Methods

### Basic CRUD

| Method | Description | Return |
|--------|-------------|--------|
| `findAll()` | Lấy tất cả entities | `Promise<Entity[]>` |
| `findById(id)` | Tìm entity theo ID | `Promise<Entity \| null>` |
| `findOne(where)` | Tìm entity theo điều kiện | `Promise<Entity \| null>` |
| `findBy(where)` | Tìm nhiều entities theo điều kiện | `Promise<Entity[]>` |
| `create(data)` | Tạo entity mới | `Promise<Entity>` |
| `update(id, data)` | Cập nhật entity | `Promise<Entity \| null>` |
| `delete(id)` | Xóa entity | `Promise<number>` |
| `exists(id)` | Kiểm tra entity tồn tại | `Promise<boolean>` |
| `existsBy(where)` | Kiểm tra tồn tại theo điều kiện | `Promise<boolean>` |
| `count()` | Đếm tất cả entities | `Promise<number>` |
| `countBy(where)` | Đếm theo điều kiện | `Promise<number>` |

### Transaction Methods

| Method | Description |
|--------|-------------|
| `withTransaction(callback)` | Execute callback trong transaction (auto commit/rollback) |
| `createQueryRunner()` | Tạo QueryRunner cho manual transaction control |
| `saveMany(entities)` | Lưu nhiều entities trong transaction |
| `createMany(dataArray)` | Tạo và lưu nhiều entities trong transaction |
| `deleteMany(ids)` | Xóa nhiều entities trong transaction |
| `executeInTransaction(sql, params)` | Execute raw SQL trong transaction |

### Helper Methods

| Method | Description |
|--------|-------------|
| `getRepository()` | Lấy TypeORM Repository instance |
| `getDataSource()` | Lấy DataSource instance |
| `createQueryBuilder(alias)` | Tạo QueryBuilder |

## Transaction Examples

### Example 1: Auto Transaction với withTransaction

```typescript
async transferProducts(fromCategoryId: string, toCategoryId: string) {
    return await this.productRepository.withTransaction(async (queryRunner) => {
        // Tất cả operations trong callback sẽ được thực hiện trong 1 transaction
        
        // Lấy products từ category cũ
        const products = await queryRunner.manager.find(Product, {
            where: { categoryId: fromCategoryId }
        });

        // Cập nhật category mới
        for (const product of products) {
            product.categoryId = toCategoryId;
            await queryRunner.manager.save(product);
        }

        // Nếu có lỗi, transaction sẽ tự động rollback
        // Nếu thành công, transaction sẽ tự động commit
        
        return { transferred: products.length };
    });
}
```

### Example 2: Bulk Operations

```typescript
// Tạo nhiều products cùng lúc
async bulkCreate(products: CreateProductDto[]) {
    // Tất cả products sẽ được tạo hoặc không có gì được tạo
    return await this.productRepository.createMany(products);
}

// Xóa nhiều products
async bulkDelete(ids: string[]) {
    return await this.productRepository.deleteMany(ids);
}
```

### Example 3: Complex Transaction

```typescript
async createProductWithRelations(data: CreateProductWithRelationsDto) {
    return await this.productRepository.withTransaction(async (queryRunner) => {
        // 1. Create product
        const product = await queryRunner.manager.save(Product, {
            name: data.name,
            categoryId: data.categoryId,
        });

        // 2. Create product media
        if (data.media && data.media.length > 0) {
            const mediaEntities = data.media.map(m => ({
                ...m,
                productId: product.id,
            }));
            await queryRunner.manager.save(ProductMedia, mediaEntities);
        }

        // 3. Create product attributes
        if (data.attributes && data.attributes.length > 0) {
            const attrEntities = data.attributes.map(a => ({
                ...a,
                productId: product.id,
            }));
            await queryRunner.manager.save(ProductAttribute, attrEntities);
        }

        // 4. Return created product with relations
        return await queryRunner.manager.findOne(Product, {
            where: { id: product.id },
            relations: ['productMedia', 'productAttributes'],
        });
    });
}
```

### Example 4: Manual Transaction Control

```typescript
async complexOperation() {
    const queryRunner = await this.productRepository.createQueryRunner();
    await queryRunner.startTransaction();

    try {
        // Step 1
        const product = await queryRunner.manager.save(Product, { 
            name: 'Test' 
        });

        // Step 2 - có thể throw error
        await this.validateProduct(product);

        // Step 3
        await queryRunner.manager.save(ProductMedia, {
            productId: product.id,
            mediaUrl: 'url',
        });

        // Commit nếu tất cả OK
        await queryRunner.commitTransaction();
        return product;

    } catch (error) {
        // Rollback nếu có lỗi
        await queryRunner.rollbackTransaction();
        throw error;

    } finally {
        // Luôn release QueryRunner
        await queryRunner.release();
    }
}
```

### Example 5: Execute Raw SQL

```typescript
async customQuery(categoryId: string) {
    return await this.productRepository.executeInTransaction(
        'UPDATE products SET discount_id = $1 WHERE category_id = $2',
        [discountId, categoryId]
    );
}
```

## Best Practices

### ✅ DO

1. **Extend BaseRepository cho mọi repository**
```typescript
export class ProductRepository extends BaseRepository<Product> {
    constructor(dataSource: DataSource) {
        super(dataSource, Product);
    }
}
```

2. **Override methods khi cần custom logic**
```typescript
// Override để thêm relations
async findById(id: string): Promise<Product | null> {
    return await this.repository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .where('product.id = :id', { id })
        .getOne();
}
```

3. **Sử dụng withTransaction cho multiple operations**
```typescript
async complexOperation() {
    return await this.withTransaction(async (queryRunner) => {
        // Multiple operations here
    });
}
```

4. **Release QueryRunner sau khi sử dụng**
```typescript
try {
    // ...
} finally {
    await queryRunner.release(); // IMPORTANT!
}
```

### ❌ DON'T

1. **Đừng inject Repository<Entity> trực tiếp vào Service**
```typescript
// ❌ BAD
@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>
    ) {}
}

// ✅ GOOD
@Injectable()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository
    ) {}
}
```

2. **Đừng quên release QueryRunner**
```typescript
// ❌ BAD - Memory leak
const queryRunner = await this.createQueryRunner();
await queryRunner.startTransaction();
// ... forgot to release

// ✅ GOOD
try {
    // ...
} finally {
    await queryRunner.release();
}
```

3. **Đừng nest transactions**
```typescript
// ❌ BAD
await this.withTransaction(async (qr1) => {
    await this.withTransaction(async (qr2) => {
        // Nested transaction - có thể gây lỗi
    });
});
```

## Error Handling

Transaction tự động rollback khi có exception:

```typescript
async transfer() {
    return await this.withTransaction(async (queryRunner) => {
        await queryRunner.manager.save(entity1);
        
        // Nếu throw error ở đây
        throw new Error('Something went wrong');
        
        // Transaction sẽ tự động rollback
        // entity1 sẽ KHÔNG được save
    });
}
```

## Testing

### Unit Test Repository

```typescript
describe('ProductRepository', () => {
    let repository: ProductRepository;
    let dataSource: DataSource;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [TypeOrmModule.forRoot(testConfig)],
            providers: [ProductRepository],
        }).compile();

        repository = module.get<ProductRepository>(ProductRepository);
        dataSource = module.get<DataSource>(DataSource);
    });

    it('should create product', async () => {
        const product = await repository.create({
            name: 'Test Product',
            categoryId: 'category-id',
        });
        expect(product.id).toBeDefined();
        expect(product.name).toBe('Test Product');
    });

    it('should rollback on error', async () => {
        await expect(
            repository.withTransaction(async (qr) => {
                await qr.manager.save(Product, { name: 'Test' });
                throw new Error('Force error');
            })
        ).rejects.toThrow('Force error');

        // Verify nothing was saved
        const count = await repository.count();
        expect(count).toBe(0);
    });
});
```

## Migration from Old Pattern

### Before (Anti-pattern)

```typescript
@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async complexOperation() {
        const product = this.productRepository.create({ name: 'Test' });
        await this.productRepository.save(product);
        // No transaction support
    }
}
```

### After (With BaseRepository)

```typescript
// 1. Create Repository
@Injectable()
export class ProductRepository extends BaseRepository<Product> {
    constructor(dataSource: DataSource) {
        super(dataSource, Product);
    }
}

// 2. Use in Service
@Injectable()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository,
    ) {}

    async complexOperation() {
        return await this.productRepository.withTransaction(async (qr) => {
            const product = await qr.manager.save(Product, { name: 'Test' });
            // More operations...
            return product;
        });
    }
}
```

## Advanced Patterns

### Repository Composition

```typescript
@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly productRepository: ProductRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async createOrder(userId: string, productIds: string[]) {
        // Sử dụng transaction từ bất kỳ repository nào
        return await this.orderRepository.withTransaction(async (queryRunner) => {
            // Tất cả operations đều trong cùng 1 transaction
            const user = await queryRunner.manager.findOne(User, { 
                where: { id: userId } 
            });
            
            const products = await queryRunner.manager.findByIds(
                Product, 
                productIds
            );

            const order = await queryRunner.manager.save(Order, {
                userId,
                total: products.reduce((sum, p) => sum + p.price, 0),
            });

            return order;
        });
    }
}
```

## Performance Tips

1. **Batch operations khi có thể**
```typescript
// ✅ GOOD - 1 transaction cho nhiều items
await this.createMany(items);

// ❌ BAD - Multiple transactions
for (const item of items) {
    await this.create(item);
}
```

2. **Sử dụng QueryBuilder cho complex queries**
```typescript
const products = await this.createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category')
    .where('product.isActive = :isActive', { isActive: true })
    .getMany();
```

3. **Index columns được query thường xuyên**
```typescript
@Index(['categoryId', 'isActive'])
@Entity('products')
export class Product {
    // ...
}
```

## Summary

BaseRepository cung cấp:
- ✅ Reusable CRUD operations
- ✅ Transaction support với auto commit/rollback
- ✅ Type-safe với Generics
- ✅ Easy to test và maintain
- ✅ Consistent pattern across the app

Sử dụng pattern này giúp code clean, DRY và dễ dàng mở rộng!

