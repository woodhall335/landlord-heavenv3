import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/grounds/[jurisdiction]/route';
import { NextRequest } from 'next/server';

describe('Grounds API', () => {
  describe('GET /api/grounds/[jurisdiction]', () => {
    it('should return 200 with grounds for england', async () => {
      const request = new NextRequest('http://localhost:3000/api/grounds/england');
      const params = Promise.resolve({ jurisdiction: 'england' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('grounds');
      expect(Array.isArray(data.grounds)).toBe(true);
      expect(data.grounds.length).toBeGreaterThan(0);

      // Verify ground structure
      const firstGround = data.grounds[0];
      expect(firstGround).toHaveProperty('ground');
      expect(firstGround).toHaveProperty('name');
      expect(firstGround).toHaveProperty('short_description');
    });

    it('should return 200 with grounds for wales', async () => {
      const request = new NextRequest('http://localhost:3000/api/grounds/wales');
      const params = Promise.resolve({ jurisdiction: 'wales' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('grounds');
      expect(Array.isArray(data.grounds)).toBe(true);
      expect(data.grounds.length).toBeGreaterThan(0);
    });

    it('should return 200 with grounds for scotland', async () => {
      const request = new NextRequest('http://localhost:3000/api/grounds/scotland');
      const params = Promise.resolve({ jurisdiction: 'scotland' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('grounds');
      expect(Array.isArray(data.grounds)).toBe(true);
      expect(data.grounds.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid jurisdiction', async () => {
      const request = new NextRequest('http://localhost:3000/api/grounds/invalid');
      const params = Promise.resolve({ jurisdiction: 'invalid' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Invalid jurisdiction');
    });

    it('should sort grounds by ground number', async () => {
      const request = new NextRequest('http://localhost:3000/api/grounds/england');
      const params = Promise.resolve({ jurisdiction: 'england' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);

      // Check that grounds are sorted
      for (let i = 1; i < data.grounds.length; i++) {
        const prevNum = parseInt(String(data.grounds[i - 1].ground).replace(/[^0-9]/g, ''), 10) || 999;
        const currNum = parseInt(String(data.grounds[i].ground).replace(/[^0-9]/g, ''), 10) || 999;
        expect(currNum).toBeGreaterThanOrEqual(prevNum);
      }
    });
  });
});
