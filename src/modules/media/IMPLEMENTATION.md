# Media Module Implementation Summary

## ✅ Hoàn thành

### 1. Database Schema Updates

#### Bảng Media (Mới)
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin_name VARCHAR(255) NOT NULL,
    media_type VARCHAR(50) NOT NULL,  -- 'image' | 'video'
    mime_type VARCHAR(100) NOT NULL,
    url VARCHAR NOT NULL,
    size BIGINT,
    width INTEGER,
    height INTEGER,
    -- Audit fields
    created_user_id UUID,
    created_at TIMESTAMP,
    updated_user_id UUID,
    updated_at TIMESTAMP,
    deleted_user_id UUID,
    deleted_at TIMESTAMP
);
```

#### Bảng product_media (Cập nhật)
- ❌ Xóa: `media_url`, `media_type`
- ✅ Thêm: `media_id UUID NOT NULL` + Foreign Key đến `media(id)`
- ✅ Giữ: `media_category` (theo yêu cầu)

#### Bảng collections (Cập nhật)
- ❌ Xóa: `background_image`
- ✅ Thêm: `media_id UUID` + Foreign Key đến `media(id)`

### 2. Entities

- ✅ `media.entity.ts` - Entity cho bảng media
- ✅ `product-media.entity.ts` - Updated với relation đến Media
- ✅ `colection.entity.ts` - Updated với relation đến Media

### 3. Module Structure

```
src/modules/media/
├── dto/
│   ├── create-media.dto.ts          # DTO cho việc tạo media
│   ├── update-media.dto.ts          # DTO cho việc cập nhật media
│   ├── media-query.dto.ts           # DTO cho query params (pagination, filter, sort)
│   ├── media-response.dto.ts        # DTO cho response
│   └── index.ts                     # Export tất cả DTOs
├── media.repository.ts              # Repository với các query methods
├── aws-s3.service.ts                # Service xử lý upload/delete S3
├── media.service.ts                 # Business logic
├── admin-media.controller.ts        # REST API endpoints
├── media.module.ts                  # NestJS module
├── index.ts                         # Export module
├── README.md                        # Hướng dẫn sử dụng
└── IMPLEMENTATION.md                # File này
```

### 4. API Endpoints

Tất cả endpoints đều yêu cầu authentication (Bearer token):

#### Upload File
```
POST /admin/media/upload
Content-Type: multipart/form-data
Body: file (max 10MB)
```

#### List Media
```
GET /admin/media?page=1&limit=10&search=banner&mediaType=image&sortBy=createdAt&sortOrder=DESC
```

#### Get Media Detail
```
GET /admin/media/:id
```

#### Get Usage Info
```
GET /admin/media/:id/usage
Response: { products: 5, collections: 2 }
```

#### Update Media Metadata
```
PATCH /admin/media/:id
Body: { name, originName, ... }
```

#### Delete Media
```
DELETE /admin/media/:id
Note: Chỉ xóa được nếu không đang được sử dụng
```

### 5. Features Implemented

#### Upload & Storage
- ✅ Upload file lên AWS S3
- ✅ Generate unique filename với UUID
- ✅ Hỗ trợ image: jpg, jpeg, png, gif, webp
- ✅ Hỗ trợ video: mp4, mov, avi
- ✅ Giới hạn file size: 10MB
- ✅ Tự động extract image dimensions (width, height)
- ✅ Lưu metadata vào database

#### Query & Filter
- ✅ Pagination (page, limit)
- ✅ Search by origin_name (ILIKE)
- ✅ Filter by media_type (image/video)
- ✅ Sorting (createdAt, updatedAt, name, originName, size)
- ✅ Sort order (ASC/DESC)

#### Protection
- ✅ Kiểm tra media có đang được sử dụng không
- ✅ Không cho phép xóa nếu đang được sử dụng trong:
  - product_media table
  - collections table
- ✅ Trả về chi tiết usage khi cố xóa media đang được sử dụng
- ✅ Tự động xóa file trên S3 khi xóa media

#### Metadata Management
- ✅ Get usage details (số lượng products, collections)
- ✅ Update metadata
- ✅ Track audit info (created_by, updated_by, deleted_by)

### 6. Dependencies Installed

```json
{
  "@aws-sdk/client-s3": "^3.922.0",
  "@aws-sdk/lib-storage": "^3.922.0",
  "multer": "^2.0.2",
  "@types/multer": "^2.0.0",
  "uuid": "^13.0.0",
  "sharp": "^0.34.4"
}
```

### 7. Environment Variables

```env
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
AWS_MEDIA_BUCKET=your-bucket-name
```

### 8. Migration

Migration file đã được tạo: `1761969995414-migration.ts`

Chạy migration:
```bash
npm run typeorm:run-migrations
```

Rollback migration:
```bash
npm run typeorm:revert-migration
```

## 📝 Notes

1. **S3 Bucket Configuration**: 
   - Bucket cần có ACL enabled
   - Objects cần có quyền public-read
   - CORS cần được config nếu upload từ frontend

2. **File Naming**: 
   - Files được lưu với pattern: `media/{uuid}.{extension}`
   - Original filename được lưu trong `origin_name`

3. **Image Processing**:
   - Sử dụng Sharp để extract dimensions
   - Chỉ áp dụng cho image types
   - Không block upload nếu extract thất bại

4. **Error Handling**:
   - Validation errors (400)
   - Not found errors (404)
   - Conflict errors khi xóa media đang được sử dụng (409)
   - Internal server errors (500)

## 🚀 Next Steps

1. Test upload functionality
2. Test delete protection
3. Setup S3 bucket permissions
4. Add frontend integration
5. Consider thêm features:
   - Image optimization/resize
   - Thumbnail generation
   - Video thumbnail extraction
   - Batch upload
   - Media folder/categories

## 🔒 Security

- ✅ All endpoints protected với AdminAuthGuard
- ✅ File type validation
- ✅ File size validation
- ✅ SQL injection protection (parameterized queries)
- ⚠️ S3 credentials trong .env (không commit lên git)

## 📊 Database Relations

```
Media (1) ──< ProductMedia (N)
Media (1) ──< Collection (N)

ProductMedia >── (N) Product (1)
Collection ── có thể có một background media
```

