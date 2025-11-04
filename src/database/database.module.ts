/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOSTNAME'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [__dirname + '\\entities\\*.entity{.ts,.js}'],
                subscribers: [__dirname + '\\entity-subscribers\\*.subscriber{.ts,.js}'],
                migrations: [__dirname + '\\migrations\\*-migration{.ts,.js}'],
                autoLoadEntities: true,
                logging: false,
                timezone: 'Z',
            }),
        }),
    ],
})
export class DatabaseModule {}
