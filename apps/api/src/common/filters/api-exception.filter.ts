import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { AiProviderError } from '../../ai/ai-provider.error';

type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.toErrorResponse(exception);

    response.status(status).json(body);
  }

  private toErrorResponse(exception: unknown): {
    status: number;
    body: ApiErrorBody;
  } {
    if (exception instanceof AiProviderError) {
      return {
        status: exception.status,
        body: {
          error: {
            code: exception.code,
            message: exception.publicMessage,
          },
        },
      };
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unexpected server error.',
        },
      },
    };
  }

  private fromHttpException(exception: HttpException): {
    status: number;
    body: ApiErrorBody;
  } {
    const status = exception.getStatus();
    const response = exception.getResponse();

    if (status === 400 && isValidationResponse(response)) {
      return {
        status,
        body: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed.',
            details: response.message,
          },
        },
      };
    }

    return {
      status,
      body: {
        error: {
          code: this.getHttpErrorCode(status),
          message:
            typeof response === 'string'
              ? response
              : 'Request could not be completed.',
        },
      },
    };
  }

  private getHttpErrorCode(status: number): string {
    if (status === 404) {
      return 'NOT_FOUND';
    }

    if (status === 401) {
      return 'UNAUTHORIZED';
    }

    if (status === 403) {
      return 'FORBIDDEN';
    }

    return 'HTTP_ERROR';
  }
}

function isValidationResponse(
  response: unknown,
): response is { message: string[] } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'message' in response &&
    Array.isArray(response.message)
  );
}
