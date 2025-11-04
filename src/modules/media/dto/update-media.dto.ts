import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMediaDto {
    @ApiPropertyOptional({ description: 'Tên file gốc', example: 'banner-updated.jpg' })
    @IsString()
    @IsOptional()
    originName?: string;
}

