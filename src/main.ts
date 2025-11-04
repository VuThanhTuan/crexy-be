import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpStatus, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const swaggerConfig = new DocumentBuilder()
        .setTitle('API with NestJS')
        .setDescription('API with Nestjs')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: '*',
        },
    });
    app.setGlobalPrefix('api');

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);

    app.useGlobalPipes(
        new ValidationPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            forbidNonWhitelisted: true,
        }),
    );
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
