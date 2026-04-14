import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Healthcheck (e2e)', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();
    });

    it('/api/healthcheck (GET)', async () => {
        const response = await request(app.getHttpServer()).get('/api/healthcheck').expect(200);

        expect(response.body).toEqual({
            status: 'ok',
            timestamp: expect.any(String),
        });
    });

    afterEach(async () => {
        await app.close();
    });
});
