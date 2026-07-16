import { describe, it, expect, vi } from 'vitest';
import { getApiBaseUrl, apiUrl } from './api.config';

describe('api.config', () => {
  it('should return local backend URL when on localhost', () => {
    vi.stubGlobal('location', {
      protocol: 'http:',
      hostname: 'localhost',
      origin: 'http://localhost'
    });

    expect(getApiBaseUrl()).toBe('http://localhost:8085');

    vi.unstubAllGlobals();
  });

  it('should return production base URL when on production host', () => {
    vi.stubGlobal('location', {
      protocol: 'https:',
      hostname: 'dsc.rodrigor.com',
      origin: 'https://dsc.rodrigor.com'
    });

    expect(getApiBaseUrl()).toBe('https://dsc.rodrigor.com');

    vi.unstubAllGlobals();
  });

  it('should return origin for any other host', () => {
    vi.stubGlobal('location', {
      protocol: 'https:',
      hostname: 'someotherhost.com',
      origin: 'https://someotherhost.com'
    });

    expect(getApiBaseUrl()).toBe('https://someotherhost.com');

    vi.unstubAllGlobals();
  });

  it('should build api url correctly', () => {
    vi.stubGlobal('location', {
      protocol: 'http:',
      hostname: 'localhost',
      origin: 'http://localhost'
    });

    expect(apiUrl('/api/test')).toBe('http://localhost:8085/api/test');
    expect(apiUrl('api/test')).toBe('http://localhost:8085/api/test');

    vi.unstubAllGlobals();
  });
});
