import { ProductionLogger } from '../src/productionLogger';
import { VSCodeContextError } from '../src/errors/VSCodeContextError';
import { LogLevel } from '../src/loggingInterface';
import fs from 'fs';
import path from 'path';

describe('ProductionLogger', () => {
  const logFilePath = path.join('logs', 'extension.log');
  let logger: ProductionLogger;

  beforeAll(() => {
    // Ensure logs directory exists
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    logger = new ProductionLogger();
  });

  afterAll(() => {
    // Clean up logs directory
    if (fs.existsSync('logs')) {
      fs.rmdirSync('logs', { recursive: true });
    }
  });

  test('should write logs to file and console', async () => {
    const testMessage = 'Test log message';
    logger.info(testMessage, { test: true });

    // Wait for logs to be written
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    expect(logContent).toContain(testMessage);
    expect(logContent).toContain('"test":true');
  });

  test('should support structured logging', async () => {
    logger.addContext('userId', 123);
    logger.log(LogLevel.INFO, 'Structured log test', { action: 'test' });

    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    expect(logContent).toContain('"userId":123');
    expect(logContent).toContain('"action":"test"');
  });

  test('should support log level changes', async () => {
    logger.setLevel(LogLevel.DEBUG);
    expect(logger.getLevel()).toBe(LogLevel.DEBUG);

    logger.debug('Debug message');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    expect(logContent).toContain('Debug message');
  });

  test('should log errors with stack traces', async () => {
    const error = new VSCodeContextError('Test error', 'TEST_ERROR');
    logger.error(error);

    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    expect(logContent).toContain('Test error');
    expect(logContent).toContain('TEST_ERROR');
    expect(logContent).toContain('VSCodeContextError');
  });

  test('should handle structured logging', async () => {
    const metadata = { userId: 123, action: 'test' };
    logger.info('Structured log test', metadata);

    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logContent = fs.readFileSync(logFilePath, 'utf-8');
    expect(logContent).toContain('"userId":123');
    expect(logContent).toContain('"action":"test"');
  });
});