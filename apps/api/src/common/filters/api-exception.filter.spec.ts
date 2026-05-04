import { ArgumentsHost, HttpException } from '@nestjs/common';

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
