import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('healthcheck')
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Get()
    @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của API' })
    @ApiResponse({ status: 200, description: 'API đang hoạt động bình thường' })
    getHealth() {
        return this.healthService.getHealth();
    }
}
