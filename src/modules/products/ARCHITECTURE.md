# Products Module Architecture

## Repository Pattern Implementation

Module này đã được refactor để sử dụng **Repository Pattern** với **BaseRepository**, tách biệt logic truy cập dữ liệu khỏi business logic.

> **📖 Chi tiết về BaseRepository:** [Database Repositories README](../../database/repositories/README.md)

## Cấu trúc

```
products/
├── dto/                          # Data Transfer Objects
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   ├── product-query.dto.ts
│   └── product-response.dto.ts
├── products.repository.ts        # Data Access Layer
├── products.service.ts           # Business Logic Layer
├── products.controller.ts        # Public API Controller
├── admin-products.controller.ts  # Admin API Controller
└── products.module.ts            # Module Configuration
```

## Layers

### 1. Repository Layer (`products.repository.ts`)
**Trách nhiệm:** Tất cả các truy cập database và query logic

**Extends:** `BaseRepository<Product>` - Kế thừa CRUD operations và transaction support

**Custom Methods:**
- `findWithFilters(query)` - Lấy danh sách sản phẩm với filter, sort, pagination
- `findById(id)` - Override để include relations (category, discount, media, attributes)
- `findOnePublished(id)` - Lấy sản phẩm đã published với relations
- `update(id, data)` - Override để return entity with relations

**Inherited from BaseRepository:**
- `create(data)` - Tạo entity mới
- `delete(id)` - Xóa entity
- `exists(id)` - Kiểm tra tồn tại
- `findAll()` - Lấy tất cả (simple)
- `findOne(where)` - Tìm theo điều kiện
- `withTransaction(callback)` - Execute trong transaction
- `createMany(dataArray)` - Bulk create
- `deleteMany(ids)` - Bulk delete
- ... và nhiều methods khác

**Ưu điểm:**
- ✅ Tập trung tất cả query logic ở một nơi
- ✅ Dễ dàng test và mock
- ✅ Có thể tái sử dụng query logic
- ✅ Dễ dàng thay đổi ORM hoặc database
- ✅ Transaction support built-in
- ✅ DRY - không lặp lại code CRUD cơ bản

### 2. Service Layer (`products.service.ts`)
**Trách nhiệm:** Business logic, validation, error handling, data transformation

**Chức năng:**
- Xử lý business rules
- Validation dữ liệu
- Error handling và throw exceptions
- Transform Entity → DTO (response)
- Gọi Repository để thao tác database

**Ưu điểm:**
- ✅ Code sạch hơn, dễ đọc
- ✅ Tách biệt business logic và data access
- ✅ Dễ dàng test business logic

### 3. Controller Layer
**Trách nhiệm:** HTTP request/response handling, routing, authentication

**Controllers:**
- `ProductsController` - Public API endpoints
- `AdminProductsController` - Admin API endpoints (có authentication)

## Ví dụ Flow

### Request Flow: GET /products
```
1. Client Request
   ↓
2. ProductsController.findAll(@Query query)
   ↓
3. ProductsService.findAllPublished(query)
   - Thêm filter isActive = true
   - Gọi ProductRepository.findAll(query)
   ↓
4. ProductRepository.findAll(query)
   - Build query với QueryBuilder
   - Apply filters, sort, pagination
   - Return [Product[], count]
   ↓
5. ProductsService
   - Map Entity → DTO
   - Calculate pagination metadata
   - Return PaginatedProductResponseDto
   ↓
6. ProductsController
   - Return JSON response to client
```

## So sánh Before & After

### ❌ Before (Anti-pattern)
```typescript
@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async findAll(query: ProductQueryDto) {
        // Query logic trực tiếp trong service
        const queryBuilder = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            // ... nhiều logic query ...
    }
}
```

**Vấn đề:**
- Service bị phình to, khó đọc
- Khó test business logic riêng biệt
- Khó tái sử dụng query logic
- Vi phạm Single Responsibility Principle

### ✅ After (Repository Pattern)
```typescript
// Repository - Data Access Layer
@Injectable()
export class ProductRepository {
    async findAll(query: ProductQueryDto): Promise<[Product[], number]> {
        // Query logic ở đây
    }
}

// Service - Business Logic Layer
@Injectable()
export class ProductsService {
    constructor(private readonly productRepository: ProductRepository) {}

    async findAll(query: ProductQueryDto): Promise<PaginatedProductResponseDto> {
        const [products, total] = await this.productRepository.findAll(query);
        // Business logic: transform, validate, etc.
    }
}
```

**Lợi ích:**
- ✅ Separation of Concerns
- ✅ Dễ test và maintain
- ✅ Code clean và readable
- ✅ Tuân theo SOLID principles

## Transaction Usage Examples

### Example 1: Bulk Create with Transaction
```typescript
// In ProductsService
async bulkCreate(products: CreateProductDto[]): Promise<ProductResponseDto[]> {
    // All products created or none - atomic operation
    const createdProducts = await this.productRepository.createMany(products);
    return createdProducts.map(product => this.mapToResponseDto(product));
}
```

### Example 2: Custom Transaction Logic
```typescript
// In ProductsService
async bulkUpdateStatus(ids: string[], isActive: boolean): Promise<{ updated: number }> {
    return await this.productRepository.withTransaction(async (queryRunner) => {
        let updated = 0;
        
        for (const id of ids) {
            const result = await queryRunner.manager.update(
                'products',
                { id },
                { isActive, updatedAt: new Date() }
            );
            updated += result.affected ?? 0;
        }

        return { updated };
    });
}
```

### Example 3: Multi-Entity Transaction
```typescript
// Create product with related entities in single transaction
async createProductWithRelations(data: CreateProductWithRelationsDto) {
    return await this.productRepository.withTransaction(async (queryRunner) => {
        // 1. Create product
        const product = await queryRunner.manager.save(Product, {
            name: data.name,
            categoryId: data.categoryId,
        });

        // 2. Create product media
        if (data.media?.length > 0) {
            await queryRunner.manager.save(
                ProductMedia,
                data.media.map(m => ({ ...m, productId: product.id }))
            );
        }

        // 3. Create product attributes  
        if (data.attributes?.length > 0) {
            await queryRunner.manager.save(
                ProductAttribute,
                data.attributes.map(a => ({ ...a, productId: product.id }))
            );
        }

        return product;
    });
}
```

## Testing Strategy

### Unit Test Repository
```typescript
describe('ProductRepository', () => {
    it('should find products with filters', async () => {
        const query = { search: 'áo', categoryId: '123' };
        const [products, count] = await repository.findWithFilters(query);
        expect(products).toBeDefined();
        expect(count).toBeGreaterThan(0);
    });

    it('should create products in transaction', async () => {
        const products = await repository.createMany([
            { name: 'Product 1', categoryId: 'cat-1' },
            { name: 'Product 2', categoryId: 'cat-1' },
        ]);
        expect(products).toHaveLength(2);
    });
});
```

### Unit Test Service
```typescript
describe('ProductsService', () => {
    it('should return paginated products', async () => {
        const mockRepo = {
            findWithFilters: jest.fn().mockResolvedValue([mockProducts, 10])
        };
        const service = new ProductsService(mockRepo);
        const result = await service.findAll(query);
        expect(result.data).toBeDefined();
        expect(result.totalPages).toBe(1);
    });
});
```

## Migration Guide

Nếu muốn áp dụng pattern này cho module khác:

### Step 1: Tạo Repository extends BaseRepository
```typescript
// module.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/database/repositories/base.repository';
import { YourEntity } from '@/database/entities/your-entity.entity';

@Injectable()
export class YourEntityRepository extends BaseRepository<YourEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, YourEntity);
    }

    // Add custom methods here
}
```

### Step 2: Di chuyển query logic từ Service → Repository
Chỉ implement các methods đặc biệt, CRUD cơ bản đã có trong BaseRepository

### Step 3: Cập nhật Service
```typescript
// Before
constructor(
    @InjectRepository(YourEntity)
    private readonly repository: Repository<YourEntity>
) {}

// After
constructor(
    private readonly repository: YourEntityRepository
) {}
```

### Step 4: Cập nhật Module
```typescript
@Module({
    imports: [TypeOrmModule.forFeature([YourEntity])],
    providers: [YourEntityRepository, YourEntityService],
    exports: [YourEntityService, YourEntityRepository],
})
```

### Step 5: Test thoroughly
- Test CRUD operations
- Test custom methods
- Test transaction scenarios

## Best Practices

1. **Repository chỉ làm việc với Entity**, không biết về DTO
2. **Service transform Entity → DTO**, không expose Entity ra ngoài
3. **Controller chỉ nhận DTO**, không biết về Entity
4. **Mỗi layer chỉ gọi layer ngay bên dưới** (Controller → Service → Repository)
5. **Repository method nên return Entity hoặc null**, để Service quyết định exception
6. **Tránh business logic trong Repository**, chỉ query logic

## Dependencies

```typescript
// Module configuration
@Module({
    imports: [
        TypeOrmModule.forFeature([Product]), // Chỉ cần Product entity
    ],
    controllers: [ProductsController, AdminProductsController],
    providers: [ProductRepository, ProductsService], // Repository trước Service
    exports: [ProductsService, ProductRepository],   // Export cả 2 nếu cần
})
export class ProductsModule {}
```

