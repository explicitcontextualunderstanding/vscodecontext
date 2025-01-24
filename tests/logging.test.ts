import { VSCodeContextError } from '../src/errors/VSCodeContextError';
import { logger } from '../src/productionLogger';
import { describe, it, expect, vi } from 'vitest';

describe('WinstonLogger', () => {
  it('should log info messages', () => {
    const spy = vi.spyOn(logger, 'info');
    logger.info('Test message');
    expect(spy).toHaveBeenCalledWith('Test message');
  });

  it('should handle error logging', () => {
    const spy = vi.spyOn(logger, 'error');
    const error = new VSCodeContextError('Test error', 'TEST_ERROR');
    logger.error(error);
    expect(spy).toHaveBeenCalledWith(error);
  });

  it('should support structured logging', () => {
    const spy = vi.spyOn(logger, 'info');
    logger.info('User action', { userId: 123, action: 'test' });
    expect(spy).toHaveBeenCalledWith('User action', {
      userId: 123,
      action: 'test',
    });
  });
});
