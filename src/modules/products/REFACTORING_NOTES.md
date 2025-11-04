# Product API Refactoring Notes

## Tổng quan các thay đổi

API tạo sản phẩm đã được refactor/upgrade để hỗ trợ các tính năng mới:

### 1. **Product Variants (Biến thể sản phẩm)**
- Một sản phẩm có thể có nhiều biến thể (variants)
- Mỗi variant là sự kết hợp của:
  - `ProductSize` (Kích thước): S, M, L, XL, etc.
  - `ProductColor` (Màu sắc): Đỏ, Xanh, Vàng, etc.
- Mỗi variant có thể active hoặc inactive
- **Yêu cầu**: Ít nhất 1 variant phải active

### 2. **Product Media (Hình ảnh sản phẩm)**
- Một sản phẩm có thể có nhiều ảnh với các loại khác nhau:
  - `preview`: Ảnh đại diện (bắt buộc, chỉ 1 ảnh)
  - `detail_list`: Ảnh slide/gallery (tối đa 10 ảnh)
  - `detail`: Ảnh chi tiết khác
- Media được lưu trước trong bảng `media`
- Product chỉ lưu reference (mediaId) đến media đã tồn tại

### 3. **Rich Text Description**
- Trường `description` hỗ trợ HTML từ rich-text editor
- Có thể chứa formatting, links, images, etc.

## Entities Changes

### ProductVariant Entity
**Thêm mới**:
- `productId`: UUID - Foreign key đến Product
- `product`: Relation ManyToOne với Product

### Product Entity
**Thêm mới**:
- `productVariants`: Relation OneToMany với ProductVariant

## DTOs

### CreateProductDto
```typescript
{
  name: string;                      // Tên sản phẩm
  description?: string;              // Mô tả (rich-text HTML)
  isActive?: boolean;                // Trạng thái (default: true)
  categoryId: string;                // ID danh mục
  discountId?: string;               // ID giảm giá (optional)
  
  // Mới thêm
  mediaItems: ProductMediaDto[];     // Danh sách media
  variants: ProductVariantDto[];     // Danh sách variants
}
```

### ProductMediaDto
```typescript
{
  mediaId: string;                   // ID của media đã tồn tại
  mediaCategory: 'preview' | 'detail_list' | 'detail';
}
```

### ProductVariantDto
```typescript
{
  sizeId?: string;                   // ID của size (optional)
  colorId?: string;                  // ID của màu (optional)
  isActive?: boolean;                // Trạng thái (default: false)
  name?: string;                     // Tên variant (auto-generate nếu không có)
  description?: string;              // Mô tả variant
}
```

## Validation Rules

### Media Validation
1. ✅ Phải có ít nhất 1 ảnh
2. ✅ Phải có đúng 1 ảnh `preview`
3. ✅ Tối đa 10 ảnh `detail_list`

### Variant Validation
1. ✅ Phải có ít nhất 1 variant
2. ✅ Phải có ít nhất 1 variant active
3. ✅ Không được phép có variant trùng lặp (cùng size và color)

## API Request Example

```json
POST /admin/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Áo thun nam cao cấp",
  "description": "<p>Áo thun nam chất liệu <strong>cotton 100%</strong></p>",
  "isActive": true,
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "discountId": "123e4567-e89b-12d3-a456-426614174001",
  
  "mediaItems": [
    {
      "mediaId": "media-uuid-1",
      "mediaCategory": "preview"
    },
    {
      "mediaId": "media-uuid-2",
      "mediaCategory": "detail_list"
    },
    {
      "mediaId": "media-uuid-3",
      "mediaCategory": "detail_list"
    }
  ],
  
  "variants": [
    {
      "sizeId": "size-s-uuid",
      "colorId": "color-red-uuid",
      "isActive": true
    },
    {
      "sizeId": "size-m-uuid",
      "colorId": "color-red-uuid",
      "isActive": false
    },
    {
      "sizeId": "size-s-uuid",
      "colorId": "color-blue-uuid",
      "isActive": false
    }
  ]
}
```

## API Response Example

```json
{
  "id": "product-uuid",
  "name": "Áo thun nam cao cấp",
  "description": "<p>Áo thun nam chất liệu <strong>cotton 100%</strong></p>",
  "isActive": true,
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "discountId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  
  "category": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Áo thun",
    "slug": "ao-thun"
  },
  
  "discount": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "name": "Giảm 20%",
    "discountValue": 20,
    "discountType": "percentage"
  },
  
  "productVariants": [
    {
      "id": "variant-uuid-1",
      "name": "Đỏ - S",
      "description": null,
      "isActive": true,
      "productSizeId": "size-s-uuid",
      "productColorId": "color-red-uuid",
      "productSize": {
        "id": "size-s-uuid",
        "name": "S",
        "description": "Size nhỏ"
      },
      "productColor": {
        "id": "color-red-uuid",
        "name": "Đỏ",
        "colorCode": "#FF0000",
        "description": "Màu đỏ"
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  
  "productMedia": [
    {
      "id": "product-media-uuid-1",
      "mediaId": "media-uuid-1",
      "mediaCategory": "preview",
      "media": {
        "id": "media-uuid-1",
        "name": "preview-image.jpg",
        "originName": "my-image.jpg",
        "url": "https://s3.amazonaws.com/bucket/preview-image.jpg",
        "mediaType": "image",
        "mimeType": "image/jpeg",
        "size": 102400,
        "width": 800,
        "height": 600
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## Database Migration

Chạy migration để update database schema:

```bash
cd crexy-be
npm run migration:run
# hoặc
yarn migration:run
```

Migration sẽ thêm:
- Cột `product_id` vào bảng `product_variants`
- Foreign key constraint từ `product_variants.product_id` đến `products.id` với CASCADE delete

## Transaction Handling

API tạo sản phẩm sử dụng transaction để đảm bảo:
1. Tạo Product
2. Tạo các ProductVariant
3. Tạo các ProductMedia

Nếu có bất kỳ lỗi nào, tất cả changes sẽ được rollback.

## Lưu ý cho Frontend

1. **Media Upload Flow**:
   - Upload media trước (POST /admin/media/upload)
   - Nhận mediaId từ response
   - Sử dụng mediaId khi tạo product

2. **Variant Generation**:
   - Frontend có thể tự động generate tất cả combinations của size x color
   - Hoặc cho phép user chọn specific combinations
   - Ít nhất 1 variant phải được đánh dấu active

3. **Rich Text Editor**:
   - Description field chấp nhận HTML
   - Sanitize HTML ở frontend để tránh XSS
   - Backend lưu HTML as-is

## Update Product API

### UpdateProductDto
Tất cả fields đều **optional**. Chỉ update các fields được gửi lên.

```typescript
{
  name?: string;                      // Tên sản phẩm
  description?: string;               // Mô tả (rich-text HTML)
  isActive?: boolean;                 // Trạng thái
  categoryId?: string;                // ID danh mục
  discountId?: string | null;         // ID giảm giá (null để xóa discount)
  
  mediaItems?: ProductMediaDto[];     // Danh sách media (replace tất cả)
  variants?: ProductVariantDto[];     // Danh sách variants (replace tất cả)
}
```

### Update Behavior

#### 1. **Update Basic Info** (Partial Update)
- Chỉ update các fields được gửi lên
- Các fields không gửi lên sẽ giữ nguyên
- **No database operations** nếu không có field nào được gửi

#### 2. **Update Media** (Smart Sync Strategy) 🎯
Sử dụng chiến lược **Compare & Sync** thông minh:

**So sánh media cũ vs mới:**
- ✅ **KEEP**: Media đã tồn tại (cùng mediaId + category) → Giữ nguyên (preserve ID, timestamps)
- ➕ **INSERT**: Media mới chưa có → Tạo mới
- ❌ **DELETE**: Media cũ không còn trong danh sách mới → Xóa

**Lợi ích:**
- Giữ nguyên IDs của media không thay đổi
- Preserve createdAt timestamp
- Ít database operations hơn
- Không break foreign key references

**Ví dụ - Xóa một ảnh và thêm ảnh mới:**

*Trước update:*
```json
[
  { "id": "pm-1", "mediaId": "m-1", "mediaCategory": "preview" },
  { "id": "pm-2", "mediaId": "m-2", "mediaCategory": "detail_list" },
  { "id": "pm-3", "mediaId": "m-3", "mediaCategory": "detail_list" }
]
```

*Gửi request:*
```json
{
  "mediaItems": [
    { "mediaId": "m-1", "mediaCategory": "preview" },          // KEEP pm-1
    { "mediaId": "m-2", "mediaCategory": "detail_list" },      // KEEP pm-2
    { "mediaId": "m-4-new", "mediaCategory": "detail_list" }   // INSERT new
  ]
}
```

*Kết quả:*
- **pm-1**: Giữ nguyên (ID không đổi)
- **pm-2**: Giữ nguyên (ID không đổi)
- **pm-3**: Bị xóa (không có trong request)
- **pm-new**: Tạo mới

#### 3. **Update Variants** (Smart Sync Strategy) 🎯
Sử dụng chiến lược **Compare & Sync** thông minh:

**So sánh variants cũ vs mới (theo sizeId + colorId):**
- ✅ **UPDATE**: Variant đã tồn tại → Update (isActive, name, description)
- ➕ **INSERT**: Variant mới (combination chưa có) → Tạo mới
- ❌ **DELETE**: Variant cũ không còn trong danh sách → Xóa

**Lợi ích:**
- Giữ nguyên variant IDs khi chỉ thay đổi isActive
- Preserve createdAt timestamp
- Tracking được history tốt hơn
- Không break foreign key references (nếu có)

**Ví dụ - Bỏ chọn màu đỏ và toggle active:**

*Trước update:*
```json
[
  { "id": "v-1", "sizeId": "s-S", "colorId": "c-red", "isActive": true },
  { "id": "v-2", "sizeId": "s-M", "colorId": "c-red", "isActive": false },
  { "id": "v-3", "sizeId": "s-S", "colorId": "c-blue", "isActive": false }
]
```

*Gửi request:*
```json
{
  "variants": [
    { "sizeId": "s-S", "colorId": "c-blue", "isActive": true },    // UPDATE v-3
    { "sizeId": "s-M", "colorId": "c-blue", "isActive": false }    // INSERT new
  ]
}
```

*Kết quả:*
- **v-1**: Bị xóa (màu đỏ không còn)
- **v-2**: Bị xóa (màu đỏ không còn)
- **v-3**: Update isActive từ false → true (ID giữ nguyên)
- **v-new**: Tạo mới (S-M + Blue)

**Ví dụ - Bỏ chọn size M (xóa các variants có size M):**
```json
{
  "variants": [
    { "sizeId": "size-s-uuid", "colorId": "color-red-uuid", "isActive": true },
    { "sizeId": "size-l-uuid", "colorId": "color-red-uuid", "isActive": false }
    // Không gửi các variants có size-m-uuid
  ]
}
```

**Ví dụ - Bỏ chọn màu đỏ (xóa các variants có màu đỏ):**
```json
{
  "variants": [
    { "sizeId": "size-s-uuid", "colorId": "color-blue-uuid", "isActive": true },
    { "sizeId": "size-m-uuid", "colorId": "color-blue-uuid", "isActive": false }
    // Không gửi các variants có color-red-uuid
  ]
}
```

#### 4. **Update Discount**
- Để **xóa discount**: Gửi `"discountId": null`
- Để **thay đổi discount**: Gửi `"discountId": "new-discount-uuid"`
- Để **giữ nguyên**: Không gửi field `discountId`

**Ví dụ - Xóa discount:**
```json
{
  "discountId": null
}
```

### Update Request Example

```json
PATCH /admin/products/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Áo thun nam cao cấp - Updated",
  "description": "<p>Mô tả mới với <strong>HTML</strong></p>",
  "isActive": true,
  "discountId": null,
  
  "mediaItems": [
    { "mediaId": "media-uuid-1", "mediaCategory": "preview" },
    { "mediaId": "media-uuid-2", "mediaCategory": "detail_list" },
    { "mediaId": "media-uuid-3", "mediaCategory": "detail_list" }
  ],
  
  "variants": [
    { "sizeId": "size-s-uuid", "colorId": "color-red-uuid", "isActive": true },
    { "sizeId": "size-m-uuid", "colorId": "color-blue-uuid", "isActive": false }
  ]
}
```

### Common Update Scenarios

#### Scenario 1: Chỉ update tên và mô tả
```json
{
  "name": "Tên mới",
  "description": "<p>Mô tả mới</p>"
}
```

#### Scenario 2: Thêm ảnh mới giữ nguyên variants
```json
{
  "mediaItems": [
    { "mediaId": "media-uuid-preview", "mediaCategory": "preview" },
    { "mediaId": "media-uuid-1", "mediaCategory": "detail_list" },
    { "mediaId": "media-uuid-2", "mediaCategory": "detail_list" },
    { "mediaId": "media-uuid-3-new", "mediaCategory": "detail_list" }
  ]
}
```

#### Scenario 3: Bỏ chọn tất cả size M và màu đỏ
```json
{
  "variants": [
    { "sizeId": "size-s-uuid", "colorId": "color-blue-uuid", "isActive": true },
    { "sizeId": "size-l-uuid", "colorId": "color-blue-uuid", "isActive": false }
    // Đã loại bỏ tất cả variants có size M hoặc màu đỏ
  ]
}
```

#### Scenario 4: Update toàn bộ
```json
{
  "name": "Tên mới",
  "description": "<p>Mô tả mới</p>",
  "isActive": true,
  "categoryId": "new-category-uuid",
  "discountId": "new-discount-uuid",
  "mediaItems": [...],
  "variants": [...]
}
```

## Why Smart Sync Strategy? 🤔

### ❌ Cách cũ: Delete All + Recreate
```typescript
// BAD: Delete all và tạo lại
await queryRunner.manager.delete(ProductVariant, { productId: id });
await queryRunner.manager.save(newVariants);
```

**Vấn đề:**
1. ❌ **IDs change**: Variant IDs mới mỗi lần update
2. ❌ **Lost timestamps**: createdAt bị reset
3. ❌ **Performance**: Nhiều DELETE + INSERT không cần thiết
4. ❌ **Audit trail**: Mất lịch sử, không track được changes
5. ❌ **Foreign keys**: Break references nếu có bảng khác reference
6. ❌ **Database load**: Unnecessary I/O operations

**Ví dụ vấn đề:**
```
User chỉ muốn toggle isActive của 1 variant:
- Cách cũ: DELETE 10 variants → INSERT 10 variants mới (20 operations)
- Database phải reindex, update foreign keys, etc.
```

### ✅ Cách mới: Smart Sync (Compare & Sync)
```typescript
// GOOD: So sánh và chỉ update những gì cần thiết
- Compare existing vs new
- UPDATE những gì thay đổi
- DELETE những gì bị bỏ
- INSERT những gì mới thêm
```

**Lợi ích:**
1. ✅ **Preserve IDs**: Giữ nguyên IDs cho data không thay đổi
2. ✅ **Preserve timestamps**: createdAt không bị reset
3. ✅ **Performance**: Chỉ update những gì cần thiết
4. ✅ **Audit trail**: Track được changes tốt hơn
5. ✅ **FK safe**: Không break foreign key references
6. ✅ **Optimized I/O**: Minimal database operations

**Ví dụ performance:**
```
Có 10 variants, user toggle isActive của 1 variant:
- Cách cũ: 10 DELETE + 10 INSERT = 20 operations
- Cách mới: 1 UPDATE = 1 operation
```

### Performance Comparison 📊

| Scenario | Cách cũ (Delete+Recreate) | Cách mới (Smart Sync) |
|----------|--------------------------|----------------------|
| Toggle 1 variant active (10 total) | 10 DELETE + 10 INSERT = 20 ops | 1 UPDATE = 1 op |
| Thêm 2 variants mới (8 cũ) | 8 DELETE + 10 INSERT = 18 ops | 2 INSERT = 2 ops |
| Xóa 2 variants (10 total) | 10 DELETE + 8 INSERT = 18 ops | 2 DELETE = 2 ops |
| Thay đổi hết variants | 10 DELETE + 10 INSERT = 20 ops | 10 UPDATE = 10 ops |

**Tổng kết:** Smart Sync **nhanh hơn 5-20x** trong hầu hết cases!

## Validation Rules - Update API

### Media Validation (nếu gửi mediaItems)
1. ✅ Phải có ít nhất 1 ảnh
2. ✅ Phải có đúng 1 ảnh `preview`
3. ✅ Tối đa 10 ảnh `detail_list`

### Media Validation (nếu KHÔNG gửi mediaItems)
1. ✅ Kiểm tra product hiện tại phải có ít nhất 1 ảnh
2. ✅ Nếu không có ảnh và không gửi mediaItems mới → Báo lỗi

### Variant Validation (nếu gửi variants)
1. ✅ Phải có ít nhất 1 variant
2. ✅ Phải có ít nhất 1 variant active
3. ✅ Không được phép có variant trùng lặp (cùng size và color)

## Testing

### Create Product với tất cả features:
```bash
curl -X POST http://localhost:3000/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{...}'
```

### Update Product - Chỉ update tên:
```bash
curl -X PATCH http://localhost:3000/admin/products/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Tên mới"}'
```

### Update Product - Xóa discount:
```bash
curl -X PATCH http://localhost:3000/admin/products/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"discountId": null}'
```

### Update Product - Replace media:
```bash
curl -X PATCH http://localhost:3000/admin/products/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"mediaItems": [...]}'
```

### Update Product - Replace variants (bỏ chọn size M):
```bash
curl -X PATCH http://localhost:3000/admin/products/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"variants": [...]}'  # Không bao gồm variants có size M
```

### Get Product với relations:
```bash
curl -X GET http://localhost:3000/admin/products/{id} \
  -H "Authorization: Bearer <token>"
```

