import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductColorsModule } from './modules/product-colors/product-colors.module';
import { ProductSizesModule } from './modules/product-sizes/product-sizes.module';
import { MediaModule } from './modules/media/media.module';
import { CategoryModule } from './modules/category/category.module';
import { DiscountModule } from './modules/discount/discount.module';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        UserModule,
        ProductsModule,
        ProductColorsModule,
        ProductSizesModule,
        MediaModule,
        CategoryModule,
        DiscountModule,
    ],
})
export class AppModule {}
