import {
  ArgumentsHost,
  ConflictException,
  HttpException,
} from '@nestjs/common';

import { ApiExceptionFilter } from './api-exception.filter';

describe('ApiExceptionFilter', () => {
  it('does not call logger.error when error logging is disabled', () => {
    const logger = { error: jest.fn() };
    const filter = new ApiExceptionFilter({ logger, logErrors: false });

    filter.catch(new Error('Unexpected failure'), createHost());

    expect(logger.error).not.toHaveBeenCalled();
  });

  it('calls logger.error when error logging is enabled', () => {
    const logger = { error: jest.fn() };
    const filter = new ApiExceptionFilter({ logger, logErrors: true });
    const exception = new HttpException('Bad request', 400);

    filter.catch(exception, createHost());

    expect(logger.error).toHaveBeenCalledWith(exception, undefined);
  });

  it('maps conflict errors to a stable code and public message', () => {
    const filter = new ApiExceptionFilter();
    const host = createHost();

    filter.catch(new ConflictException('Email is already registered.'), host);

    const response = getResponse(host);
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'CONFLICT',
        message: 'Email is already registered.',
      },
    });
  });
});

function createHost(): ArgumentsHost {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  return {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
}

function getResponse(host: ArgumentsHost): {
  status: jest.Mock;
  json: jest.Mock;
} {
  return host.switchToHttp().getResponse();
}
