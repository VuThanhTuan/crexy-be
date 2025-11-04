# Products Module

Module quản lý sản phẩm với các API CRUD đầy đủ cho cả admin và storefront.

> **📖 Xem thêm:** [ARCHITECTURE.md](./ARCHITECTURE.md) - Chi tiết về Repository Pattern và kiến trúc module

## Cấu trúc

```
src/modules/products/
├── dto/
│   ├── create-product.dto.ts      # DTO tạo sản phẩm
│   ├── update-product.dto.ts      # DTO cập nhật sản phẩm
│   ├── product-query.dto.ts       # DTO query parameters
│   ├── product-response.dto.ts    # DTO response
│   └── index.ts                   # Export tất cả DTOs
├── products.repository.ts         # Repository - Data Access Layer
├── products.service.ts            # Service - Business Logic Layer
├── products.controller.ts         # Controller - Public API
├── admin-products.controller.ts   # Controller - Admin API
├── products.module.ts             # Module definition
├── README.md                      # API Documentation (file này)
└── ARCHITECTURE.md                # Technical Architecture
```

**Pattern:** Repository Pattern - Tách biệt Data Access và Business Logic

## API Endpoints

### Admin APIs (Cần authentication)
- `POST /api/admin/products` - Tạo sản phẩm mới
- `GET /api/admin/products` - Lấy danh sách sản phẩm (tất cả)
- `GET /api/admin/products/:id` - Lấy chi tiết sản phẩm (tất cả)
- `PATCH /api/admin/products/:id` - Cập nhật sản phẩm
- `DELETE /api/admin/products/:id` - Xóa sản phẩm

### Public APIs (Storefront)
- `GET /api/products` - Lấy danh sách sản phẩm (chỉ active)
- `GET /api/products/:id` - Lấy chi tiết sản phẩm (chỉ active)

## Query Parameters

### ProductQueryDto
- `search` (string): Tìm kiếm theo tên sản phẩm
- `categoryId` (string): Lọc theo danh mục
- `isActive` (boolean): Lọc theo trạng thái (chỉ admin)
- `page` (number): Số trang (default: 1)
- `limit` (number): Số lượng mỗi trang (default: 10, max: 100)
- `sortBy` (string): Sắp xếp theo trường (default: 'createdAt')
- `sortOrder` (string): Thứ tự sắp xếp ('ASC' | 'DESC', default: 'DESC')

## Ví dụ sử dụng

### Tạo sản phẩm mới
```bash
POST /api/admin/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Áo thun nam",
  "description": "Áo thun nam chất liệu cotton 100%",
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "isActive": true
}
```

### Lấy danh sách sản phẩm
```bash
GET /api/products?page=1&limit=10&search=áo&categoryId=123e4567-e89b-12d3-a456-426614174000
```

### Cập nhật sản phẩm
```bash
PATCH /api/admin/products/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Áo thun nam cập nhật",
  "isActive": false
}
```

## Response Format

### Single Product
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Áo thun nam",
  "description": "Áo thun nam chất liệu cotton 100%",
  "isActive": true,
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "discountId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "category": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Áo thun",
    "slug": "ao-thun"
  },
  "discount": null
}
```

### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

## Error Handling

- `400 Bad Request`: Dữ liệu không hợp lệ
- `404 Not Found`: Không tìm thấy sản phẩm
- `401 Unauthorized`: Chưa đăng nhập (admin APIs)
- `403 Forbidden`: Không có quyền truy cập (admin APIs)
