import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserAuthGuard } from '@/common/guards/user-auth.guard';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function UserAuth() {
  return applyDecorators(
    UseGuards(UserAuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
