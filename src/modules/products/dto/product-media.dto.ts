import { IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MEDIA_CATEGORY } from '@/common/consts/app';
import { MediaCategory } from '@/common/types/types';

export class ProductMediaDto {
    @ApiProperty({ 
        description: 'ID của media', 
        example: '123e4567-e89b-12d3-a456-426614174000' 
    })
    @IsUUID()
    mediaId: string;

    @ApiProperty({ 
        description: 'Loại media (primary, secondary, slider)', 
        enum: Object.values(MEDIA_CATEGORY),
        example: MEDIA_CATEGORY.PRIMARY 
    })
    @IsEnum(MEDIA_CATEGORY)
    mediaCategory: MediaCategory;
}

