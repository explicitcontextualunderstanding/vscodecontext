import { describe, it, expect, beforeEach } from 'vitest';
import type { ContextData } from '../src/cacheInterface';
import { ContextCache } from '../src/cacheInterface';

describe('ContextCache', () => {
  let cache: ContextCache;

  beforeEach(() => {
    cache = new ContextCache();
  });

  it('should store and retrieve values', () => {
    const testData: ContextData = {
      timestamp: Date.now(),
      data: { test: 'value' },
    };

    cache.set('test-key', testData);
    const retrieved = cache.get('test-key');

    expect(retrieved).toBeDefined();
    expect(retrieved).toEqual(testData);
  });

  it('should track cache hits and misses', () => {
    const testData: ContextData = {
      timestamp: Date.now(),
      data: { test: 'value' },
    };

    // Set and get to increment hits
    cache.set('test-key', testData);
    cache.get('test-key');
    cache.get('test-key');

    // Get non-existent key to increment misses
    cache.get('non-existent');

    const stats = cache.stats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.sets).toBe(1);
  });

  it('should handle deletion correctly', () => {
    const testData: ContextData = {
      timestamp: Date.now(),
      data: { test: 'value' },
    };

    cache.set('test-key', testData);
    expect(cache.get('test-key')).toBeDefined();

    const deleteResult = cache.del('test-key');
    expect(deleteResult).toBe(1);
    expect(cache.get('test-key')).toBeUndefined();

    const stats = cache.stats();
    expect(stats.deletes).toBe(1);
  });

  it('should flush cache correctly', () => {
    const testData: ContextData = {
      timestamp: Date.now(),
      data: { test: 'value' },
    };

    cache.set('test-key-1', testData);
    cache.set('test-key-2', testData);

    cache.flush();

    expect(cache.get('test-key-1')).toBeUndefined();
    expect(cache.get('test-key-2')).toBeUndefined();

    const stats = cache.stats();
    expect(stats.hits).toBe(0);
    expect(stats.sets).toBe(0);
  });

  it('should peek at values without affecting LRU order', () => {
    const testData: ContextData = {
      timestamp: Date.now(),
      data: { test: 'value' },
    };

    cache.set('test-key', testData);
    const peeked = cache.peek('test-key');

    expect(peeked).toEqual(testData);
    const stats = cache.stats();
    expect(stats.hits).toBe(0); // Peek shouldn't count as a hit
  });
});