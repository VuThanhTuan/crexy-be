# Media Module

Module quản lý media files (ảnh, video) với tính năng upload lên AWS S3.

## Tính năng

### 1. Upload File lên S3
- **Endpoint**: `POST /admin/media/upload`
- Upload file lên AWS S3 bucket
- Tự động tạo record trong database
- Hỗ trợ ảnh: jpg, jpeg, png, gif, webp
- Hỗ trợ video: mp4, mov, avi
- Giới hạn: 10MB/file
- Tự động extract metadata (width, height) cho ảnh

### 2. Quản lý Media
- **Danh sách**: `GET /admin/media`
  - Pagination
  - Tìm kiếm theo tên gốc (origin_name)
  - Lọc theo loại media (image/video)
  - Sắp xếp
  - Hiển thị trạng thái đang sử dụng

- **Chi tiết**: `GET /admin/media/:id`
  - Thông tin đầy đủ về media
  - Trạng thái có đang được sử dụng không

- **Cập nhật**: `PATCH /admin/media/:id`
  - Cập nhật metadata (name, originName, etc.)

- **Xóa**: `DELETE /admin/media/:id`
  - Chỉ được xóa nếu media không đang được sử dụng
  - Tự động xóa file trên S3

### 3. Kiểm tra Usage
- **Endpoint**: `GET /admin/media/:id/usage`
- Trả về số lượng products và collections đang sử dụng media

## Cấu hình

### Environment Variables (.env)
```
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
AWS_MEDIA_BUCKET=your-bucket-name
```

### AWS S3 Bucket Configuration
- Bucket phải có quyền public-read cho các object
- CORS configuration cần được setup nếu upload từ frontend

## Sử dụng

### Upload File
```bash
curl -X POST http://localhost:3001/admin/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### Lấy danh sách media
```bash
curl -X GET "http://localhost:3001/admin/media?page=1&limit=10&search=banner&mediaType=image" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Kiểm tra usage
```bash
curl -X GET "http://localhost:3001/admin/media/{id}/usage" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Xóa media
```bash
curl -X DELETE "http://localhost:3001/admin/media/{id}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

### Media Table
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin_name VARCHAR(255) NOT NULL,
    media_type VARCHAR(50) NOT NULL, -- 'image' or 'video'
    mime_type VARCHAR(100) NOT NULL,
    url VARCHAR NOT NULL,
    size BIGINT,
    width INT,
    height INT,
    created_user_id UUID,
    created_at TIMESTAMP,
    updated_user_id UUID,
    updated_at TIMESTAMP,
    deleted_user_id UUID,
    deleted_at TIMESTAMP
);
```

## Bảo vệ Xóa Media

Module tự động kiểm tra và **không cho phép xóa** media nếu:
- Đang được sử dụng trong bảng `product_media`
- Đang được sử dụng trong bảng `collections`

Khi xóa media:
1. Kiểm tra usage
2. Nếu không được sử dụng:
   - Xóa file trên S3
   - Xóa record trong database
3. Nếu đang được sử dụng:
   - Trả về lỗi 409 Conflict
   - Thông báo số lượng products/collections đang sử dụng

## Architecture

```
AdminMediaController
    ↓
MediaService
    ├→ MediaRepository (Database operations)
    └→ AwsS3Service (S3 operations)
```

## Dependencies

- `@aws-sdk/client-s3` - AWS S3 client
- `@aws-sdk/lib-storage` - Multipart upload
- `multer` - File upload handling
- `sharp` - Image processing (extract dimensions)
- `uuid` - Generate unique file names

