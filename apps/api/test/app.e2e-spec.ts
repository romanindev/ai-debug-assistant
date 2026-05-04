import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ApiExceptionFilter } from './../src/common/filters/api-exception.filter';
import { AppModule } from './../src/app.module';

type ValidationErrorResponse = {
  error: {
    code: string;
    message: string;
    details: string[];
  };
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({
      status: 'ok',
      service: 'ai-debug-assistant-api',
    });
  });

  it('/debug/analyze (POST)', () => {
    return request(app.getHttpServer())
      .post('/debug/analyze')
      .send({
        context: 'react',
        errorText: 'TypeError: Cannot read properties of undefined',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          summary:
            'Detected a react debugging issue: TypeError: Cannot read properties of undefined',
          possibleCause:
            'The issue is likely caused by a mismatch between the expected runtime state and the actual value or execution path.',
          suggestedFix:
            'Start by isolating the failing line, checking the relevant inputs, and verifying that the environment matches the code assumptions.',
          codeExample: 'if (!data) return null;',
          checklist: [
            'Read the first error line and identify the failing symbol or operation.',
            'Inspect the stack trace from top to bottom until it reaches your application code.',
            'Reproduce the issue with the smallest possible input or component state.',
            'Add a focused guard, type check, or failing test before changing broader code.',
          ],
        });
      });
  });

  it('/debug/analyze (POST) validates request body', () => {
    return request(app.getHttpServer())
      .post('/debug/analyze')
      .send({
        context: 'unknown',
        errorText: 'short',
        extra: 'not allowed',
      })
      .expect(400)
      .expect(({ body }) => {
        const responseBody = body as ValidationErrorResponse;

        expect(responseBody.error.code).toBe('VALIDATION_ERROR');
        expect(responseBody.error.message).toBe('Request validation failed.');
        expect(responseBody.error.details).toEqual(
          expect.arrayContaining([
            'property extra should not exist',
            'errorText must be longer than or equal to 10 characters',
            'context must be one of the following values: react, node, nestjs, typescript, general',
          ]),
        );
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
