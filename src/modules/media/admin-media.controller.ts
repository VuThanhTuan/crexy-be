import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    Query, 
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaQueryDto } from './dto/media-query.dto';
import { 
    MediaResponseDto, 
    PaginatedMediaResponseDto,
    UploadMediaResponseDto 
} from './dto/media-response.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard';

@ApiTags('Admin Media')
@ApiBearerAuth()
@Controller('admin/media')
@UseGuards(AdminAuthGuard)
export class AdminMediaController {
    constructor(private readonly mediaService: MediaService) {}

    @Post('upload')
    @ApiOperation({ summary: 'Upload file lên S3 và tạo media record' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Upload thành công', 
        type: UploadMediaResponseDto 
    })
    @ApiResponse({ status: 400, description: 'File không hợp lệ' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({ 
                        fileType: /(jpg|jpeg|png|gif|webp|mp4|mov|avi)$/i 
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
    ): Promise<UploadMediaResponseDto> {
        return await this.mediaService.uploadFile(file);
    }

    @Post()
    @ApiOperation({ summary: 'Tạo media record thủ công (không upload)' })
    @ApiResponse({ 
        status: 201, 
        description: 'Tạo media thành công', 
        type: MediaResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async create(@Body() createMediaDto: CreateMediaDto): Promise<MediaResponseDto> {
        return await this.mediaService.create(createMediaDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách media' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy danh sách thành công', 
        type: PaginatedMediaResponseDto 
    })
    async findAll(@Query() query: MediaQueryDto): Promise<PaginatedMediaResponseDto> {
        return await this.mediaService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết media' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy chi tiết thành công', 
        type: MediaResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
    async findOne(@Param('id') id: string): Promise<MediaResponseDto> {
        return await this.mediaService.findOne(id);
    }

    @Get(':id/usage')
    @ApiOperation({ summary: 'Lấy thông tin sử dụng của media' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy thông tin thành công',
        schema: {
            type: 'object',
            properties: {
                products: { type: 'number', description: 'Số lượng sản phẩm đang sử dụng' },
                collections: { type: 'number', description: 'Số lượng collection đang sử dụng' },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
    async getUsage(@Param('id') id: string): Promise<{ products: number; collections: number }> {
        return await this.mediaService.getUsageDetails(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật tên file gốc của media' })
    @ApiResponse({ 
        status: 200, 
        description: 'Cập nhật thành công', 
        type: MediaResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async update(
        @Param('id') id: string, 
        @Body() updateMediaDto: UpdateMediaDto
    ): Promise<MediaResponseDto> {
        return await this.mediaService.update(id, updateMediaDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Xóa media (chỉ được xóa nếu không đang được sử dụng)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Xóa thành công',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Xóa media thành công' },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy media' })
    @ApiResponse({ status: 409, description: 'Media đang được sử dụng, không thể xóa' })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        return await this.mediaService.delete(id);
    }
}

