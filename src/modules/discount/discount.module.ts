import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountService } from './discount.service';
import { AdminDiscountController } from './admin-discount.controller';
import { DiscountRepository } from './discount.repository';
import { Discount } from '@/database/entities/discount.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Discount]),
    ],
    controllers: [AdminDiscountController],
    providers: [DiscountRepository, DiscountService],
    exports: [DiscountService, DiscountRepository],
})
export class DiscountModule {}

