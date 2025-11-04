# Product Colors API

Module quản lý màu sắc sản phẩm với đầy đủ chức năng CRUD.

## Tính năng

- ✅ CRUD đầy đủ cho màu sắc sản phẩm
- ✅ Validation mã màu HEX (bắt buộc format #RRGGBB)
- ✅ Phân trang và tìm kiếm
- ✅ Sắp xếp linh hoạt
- ✅ Kiểm tra trùng lặp mã màu
- ✅ Swagger documentation
- ✅ Admin authentication guard

## API Endpoints

Tất cả các endpoints yêu cầu authentication với Bearer token (Admin).

### 1. Tạo màu sắc mới

**POST** `/admin/product-colors`

**Request Body:**
```json
{
  "name": "Đỏ tươi",
  "colorCode": "#FF0000",
  "description": "Màu đỏ tươi, phù hợp với phong cách năng động"
}
```

**Response:** `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Đỏ tươi",
  "colorCode": "#FF0000",
  "description": "Màu đỏ tươi, phù hợp với phong cách năng động",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Validation Rules:**
- `name`: Bắt buộc, tối đa 255 ký tự
- `colorCode`: Bắt buộc, phải là mã HEX hợp lệ (format: #RRGGBB)
- `description`: Tùy chọn

### 2. Lấy danh sách màu sắc

**GET** `/admin/product-colors`

**Query Parameters:**
- `page` (optional): Số trang, mặc định = 1
- `limit` (optional): Số bản ghi mỗi trang, mặc định = 10
- `search` (optional): Tìm kiếm theo tên màu
- `sortBy` (optional): Sắp xếp theo trường (name, createdAt, updatedAt), mặc định = createdAt
- `sortOrder` (optional): Thứ tự sắp xếp (ASC, DESC), mặc định = DESC

**Example:**
```
GET /admin/product-colors?page=1&limit=20&search=Đỏ&sortBy=name&sortOrder=ASC
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Đỏ tươi",
      "colorCode": "#FF0000",
      "description": "Màu đỏ tươi",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 3. Lấy chi tiết màu sắc

**GET** `/admin/product-colors/:id`

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Đỏ tươi",
  "colorCode": "#FF0000",
  "description": "Màu đỏ tươi",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Cập nhật màu sắc

**PATCH** `/admin/product-colors/:id`

**Request Body:** (Tất cả các trường đều tùy chọn)
```json
{
  "name": "Đỏ tươi mới",
  "colorCode": "#FF0001",
  "description": "Mô tả mới"
}
```

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Đỏ tươi mới",
  "colorCode": "#FF0001",
  "description": "Mô tả mới",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:10:00.000Z"
}
```

### 5. Xóa màu sắc

**DELETE** `/admin/product-colors/:id`

**Response:** `200 OK`
```json
{
  "message": "Xóa màu sắc thành công"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Mã màu phải là mã HEX hợp lệ (ví dụ: #FF0000)",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy màu sắc với ID: xxx",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Mã màu #FF0000 đã tồn tại",
  "error": "Conflict"
}
```

## Validation

### Mã màu HEX
Module này sử dụng regex validation để đảm bảo mã màu hợp lệ:
- Phải bắt đầu bằng dấu `#`
- Theo sau là đúng 6 ký tự hex (0-9, A-F, a-f)
- Ví dụ hợp lệ: `#FF0000`, `#00ff00`, `#0000FF`, `#AbCdEf`
- Ví dụ không hợp lệ: `FF0000`, `#FFF`, `#GGGGGG`, `rgb(255,0,0)`

## Cấu trúc module

```
src/modules/product-colors/
├── dto/
│   ├── create-product-color.dto.ts       # DTO tạo mới
│   ├── update-product-color.dto.ts       # DTO cập nhật
│   ├── product-color-response.dto.ts     # DTO response
│   └── product-color-query.dto.ts        # DTO query parameters
├── product-colors.repository.ts          # Repository với custom queries
├── product-colors.service.ts             # Business logic
├── admin-product-colors.controller.ts    # Admin API endpoints
├── product-colors.module.ts              # Module definition
└── README.md                             # Tài liệu này
```

## Testing với Swagger

Sau khi khởi động server, truy cập Swagger UI để test các API:
- URL: `http://localhost:3000/api` (hoặc port được cấu hình)
- Tìm section **Admin Product Colors**
- Nhập Bearer token vào nút **Authorize**
- Test các endpoints

## Examples

### Tạo một số màu sắc phổ biến

```bash
# Đỏ
curl -X POST http://localhost:3000/admin/product-colors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Đỏ","colorCode":"#FF0000"}'

# Xanh lá
curl -X POST http://localhost:3000/admin/product-colors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Xanh lá","colorCode":"#00FF00"}'

# Xanh dương
curl -X POST http://localhost:3000/admin/product-colors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Xanh dương","colorCode":"#0000FF"}'

# Đen
curl -X POST http://localhost:3000/admin/product-colors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Đen","colorCode":"#000000"}'

# Trắng
curl -X POST http://localhost:3000/admin/product-colors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Trắng","colorCode":"#FFFFFF"}'
```

