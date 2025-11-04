import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '@/common/types/types';

export class MediaResponseDto {
    @ApiProperty({ description: 'ID media' })
    id: string;

    @ApiProperty({ description: 'Tên file' })
    name: string;

    @ApiProperty({ description: 'Tên file gốc' })
    originName: string;

    @ApiProperty({ description: 'Loại media', enum: ['image', 'video'] })
    mediaType: MediaType;

    @ApiProperty({ description: 'MIME type' })
    mimeType: string;

    @ApiProperty({ description: 'URL file' })
    url: string;

    @ApiProperty({ description: 'Kích thước file (bytes)', required: false })
    size?: number;

    @ApiProperty({ description: 'Chiều rộng (px)', required: false })
    width?: number;

    @ApiProperty({ description: 'Chiều cao (px)', required: false })
    height?: number;

    @ApiProperty({ description: 'Ngày tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật' })
    updatedAt: Date;

    @ApiProperty({ description: 'Có đang được sử dụng không', required: false })
    isInUse?: boolean;
}

export class PaginatedMediaResponseDto {
    @ApiProperty({ type: [MediaResponseDto], description: 'Danh sách media' })
    data: MediaResponseDto[];

    @ApiProperty({ description: 'Tổng số records' })
    total: number;

    @ApiProperty({ description: 'Trang hiện tại' })
    page: number;

    @ApiProperty({ description: 'Số lượng mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Tổng số trang' })
    totalPages: number;
}

export class UploadMediaResponseDto {
    @ApiProperty({ description: 'Thông báo' })
    message: string;

    @ApiProperty({ type: MediaResponseDto, description: 'Media đã upload' })
    data: MediaResponseDto;
}

