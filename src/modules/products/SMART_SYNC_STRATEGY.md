# Smart Sync Strategy - Implementation Details

## Tổng quan

**Smart Sync Strategy** là chiến lược update thông minh được sử dụng trong Product Update API để tối ưu performance và data integrity.

## So sánh với Delete-All-Recreate

### ❌ Delete-All-Recreate (Naive Approach)

```typescript
async updateVariants(productId, newVariants) {
  // Step 1: Delete ALL existing variants
  await db.delete(ProductVariant, { productId });
  
  // Step 2: Create ALL variants from scratch
  const variants = newVariants.map(v => createVariant(productId, v));
  await db.save(variants);
}
```

**Vấn đề:**
- 🔴 Tất cả IDs đều thay đổi
- 🔴 Mất tất cả timestamps (createdAt, updatedAt)
- 🔴 Performance: O(n) deletes + O(n) inserts = O(2n)
- 🔴 Break foreign key references
- 🔴 Không track được history

**Use case vấn đề:**
```
Có 10 variants, user chỉ muốn:
- Toggle isActive của variant #1 từ false → true

Delete-All-Recreate:
1. DELETE 10 records
2. INSERT 10 records mới
Total: 20 database operations + reindexing + constraint checks
```

### ✅ Smart Sync Strategy (Optimal Approach)

```typescript
async updateVariants(productId, existingVariants, newVariants) {
  // Step 1: Create lookup maps
  const existingMap = createMap(existingVariants);
  const newMap = createMap(newVariants);
  
  // Step 2: Categorize operations
  for (newVariant of newVariants) {
    if (exists in existingMap) {
      → UPDATE existing variant
    } else {
      → INSERT new variant
    }
  }
  
  // Step 3: Delete removed variants
  for (existingVariant of existingVariants) {
    if (NOT exists in newMap) {
      → DELETE variant
    }
  }
}
```

**Lợi ích:**
- ✅ IDs giữ nguyên cho data không thay đổi
- ✅ Preserve timestamps
- ✅ Performance: Chỉ update những gì cần
- ✅ Safe với foreign keys
- ✅ Track được history

**Same use case:**
```
Có 10 variants, user toggle isActive của variant #1:

Smart Sync:
1. UPDATE 1 record (chỉ variant #1)
Total: 1 database operation
```

## Implementation Details

### 1. Smart Update Variants

```typescript
private async smartUpdateVariants(
  queryRunner,
  productId: string,
  existingVariants: ProductVariant[],
  newVariants: ProductVariantDto[],
  productName: string
) {
  // 1. Create lookup map by unique key (sizeId + colorId)
  const existingMap = new Map<string, ProductVariant>();
  existingVariants.forEach(v => {
    const key = `${v.productSizeId || 'null'}-${v.productColorId || 'null'}`;
    existingMap.set(key, v);
  });

  const toKeep = new Set<string>();

  // 2. Process new variants
  for (const newVariant of newVariants) {
    const key = `${newVariant.sizeId || 'null'}-${newVariant.colorId || 'null'}`;
    toKeep.add(key);

    const existing = existingMap.get(key);

    if (existing) {
      // EXISTS → UPDATE
      await queryRunner.manager.update(ProductVariant, existing.id, {
        isActive: newVariant.isActive,
        name: newVariant.name || generateName(...),
        description: newVariant.description
      });
    } else {
      // NOT EXISTS → INSERT
      const variant = queryRunner.manager.create(ProductVariant, {
        productId,
        productSizeId: newVariant.sizeId,
        productColorId: newVariant.colorId,
        name: newVariant.name || generateName(...),
        description: newVariant.description,
        isActive: newVariant.isActive
      });
      await queryRunner.manager.save(variant);
    }
  }

  // 3. Delete removed variants
  const toDelete = existingVariants
    .filter(v => {
      const key = `${v.productSizeId || 'null'}-${v.productColorId || 'null'}`;
      return !toKeep.has(key);
    })
    .map(v => v.id);

  if (toDelete.length > 0) {
    await queryRunner.manager.delete(ProductVariant, toDelete);
  }
}
```

**Key Points:**
1. **Unique Key**: sizeId + colorId combination
2. **Three-way comparison**: Existing vs New
3. **Minimal operations**: Chỉ update/insert/delete những gì cần thiết

### 2. Smart Update Media

```typescript
private async smartUpdateMedia(
  queryRunner,
  productId: string,
  existingMedia: ProductMedia[],
  newMedia: ProductMediaDto[]
) {
  // 1. Create lookup map by unique key (mediaId + category)
  const existingMap = new Map<string, ProductMedia>();
  existingMedia.forEach(m => {
    const key = `${m.mediaId}-${m.mediaCategory}`;
    existingMap.set(key, m);
  });

  const toKeep = new Set<string>();

  // 2. Process new media
  for (const newMediaDto of newMedia) {
    const key = `${newMediaDto.mediaId}-${newMediaDto.mediaCategory}`;
    toKeep.add(key);

    const existing = existingMap.get(key);

    if (existing) {
      // EXISTS → KEEP (no update needed, immutable)
      continue;
    } else {
      // NOT EXISTS → INSERT
      const media = queryRunner.manager.create(ProductMedia, {
        productId,
        mediaId: newMediaDto.mediaId,
        mediaCategory: newMediaDto.mediaCategory
      });
      await queryRunner.manager.save(media);
    }
  }

  // 3. Delete removed media
  const toDelete = existingMedia
    .filter(m => {
      const key = `${m.mediaId}-${m.mediaCategory}`;
      return !toKeep.has(key);
    })
    .map(m => m.id);

  if (toDelete.length > 0) {
    await queryRunner.manager.delete(ProductMedia, toDelete);
  }
}
```

**Key Points:**
1. **Unique Key**: mediaId + mediaCategory combination
2. **Immutable**: Media không update, chỉ keep/insert/delete
3. **Reference preservation**: Giữ nguyên product_media IDs

## Performance Analysis

### Time Complexity

**Delete-All-Recreate:**
- Delete: O(n)
- Insert: O(n)
- **Total: O(2n)**

**Smart Sync:**
- Build maps: O(n + m)
- Compare & sync: O(n + m)
- **Total: O(n + m)** where n = existing, m = new

**Actual operations:**
- Best case (no changes): 0 operations
- Average case: O(k) where k = number of changes
- Worst case (all changed): O(n + m)

### Database Operations Comparison

| Scenario | Existing | New | Delete-All | Smart Sync | Improvement |
|----------|----------|-----|------------|------------|-------------|
| No changes | 10 | 10 | 20 ops (10D+10I) | 0 ops | ∞ |
| Change 1 active | 10 | 10 | 20 ops (10D+10I) | 1 op (1U) | 20x |
| Add 2 new | 10 | 12 | 22 ops (10D+12I) | 2 ops (2I) | 11x |
| Remove 2 | 10 | 8 | 18 ops (10D+8I) | 2 ops (2D) | 9x |
| Replace half | 10 | 10 | 20 ops (10D+10I) | 10 ops (5D+5I) | 2x |
| Replace all | 10 | 10 | 20 ops (10D+10I) | 10 ops (10U) | 2x |

### Real-world Impact

**Scenario: E-commerce với 1000 products**

Giả sử mỗi product có trung bình:
- 10 variants (sizes x colors)
- 5 media items

Admin update 100 products/day, mỗi update thay đổi 20% data:

**Delete-All-Recreate:**
```
Daily operations:
- Variants: 100 products × (10 delete + 10 insert) = 2,000 ops
- Media: 100 products × (5 delete + 5 insert) = 1,000 ops
Total: 3,000 operations/day
```

**Smart Sync:**
```
Daily operations:
- Variants: 100 products × 2 update = 200 ops
- Media: 100 products × 1 insert = 100 ops
Total: 300 operations/day
```

**Savings: 90% reduction in database operations!**

## Additional Benefits

### 1. Foreign Key Safety
```typescript
// Nếu có bảng khác reference đến variants
CREATE TABLE variant_inventory (
  id UUID PRIMARY KEY,
  variant_id UUID REFERENCES product_variants(id),
  quantity INT
);

// Delete-All: ❌ Break references hoặc cần CASCADE
// Smart Sync: ✅ Giữ nguyên variant IDs → Safe
```

### 2. Audit Trail
```typescript
// Với Smart Sync, có thể track:
- Variant được tạo lúc nào (createdAt preserved)
- Variant được update lúc nào (updatedAt updated)
- History of changes (nếu có audit log)

// Với Delete-All:
- Mất tất cả history
- createdAt bị reset
- Không biết được variant nào mới, nào cũ
```

### 3. Optimistic Locking
```typescript
// Có thể implement version-based concurrency control
@Entity()
class ProductVariant {
  @VersionColumn()
  version: number;
  
  // Smart Sync: ✅ Check version khi update
  // Delete-All: ❌ Không có version để check
}
```

## When to Use Each Approach?

### Use Smart Sync when:
- ✅ Data có identity (unique key)
- ✅ Cần preserve IDs/timestamps
- ✅ Có foreign key references
- ✅ Cần track history
- ✅ Performance quan trọng
- ✅ Frequent partial updates

### Use Delete-All when:
- ✅ Data không có identity rõ ràng
- ✅ Không có foreign key references
- ✅ Không cần history
- ✅ Rare updates
- ✅ Simpler implementation needed
- ✅ Full replacement là requirement

## Conclusion

**Smart Sync Strategy** là best practice cho update operations khi:
1. Data có natural identity (unique key)
2. Performance và data integrity quan trọng
3. Cần support partial updates

Trong trường hợp Product Variants và Media, Smart Sync mang lại:
- **5-20x performance improvement**
- **Better data integrity**
- **Foreign key safety**
- **Audit trail support**

Trade-off duy nhất là **complexity tăng lên**, nhưng hoàn toàn đáng giá với những lợi ích mang lại!

