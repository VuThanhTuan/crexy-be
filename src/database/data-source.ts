import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();
const configService = new ConfigService();
// the data source is used to connect to the database and manage migrations
export default new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOSTNAME'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '\\entities\\*.entity{.ts,.js}'],
    subscribers: [__dirname + '\\entity-subscribers\\*.subscriber{.ts,.js}'],
    migrations: [__dirname + '\\migrations\\*-migration{.ts,.js}'],
});
