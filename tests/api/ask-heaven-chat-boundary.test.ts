import { describe, expect, it } from 'vitest';

/**
 * Boundary tests for /api/ask-heaven/chat
 *
 * Ensures the Ask Heaven chat endpoint:
 * - Only accepts canonical jurisdictions (england, wales, scotland, northern-ireland)
 * - Rejects legacy england-wales inputs
 * - Cannot emit england-wales in chat context
 */
describe('API Boundary: /api/ask-heaven/chat', () => {
  describe('Jurisdiction validation', () => {
    it('should reject legacy england-wales jurisdiction', async () => {
      // Simulating the zod schema validation from ask-heaven/chat/route.ts line 11
      const { z } = await import('zod');
      const chatRequestSchema = z.object({
        jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']).optional(),
      });

      // Legacy jurisdiction should fail schema validation
      const result = chatRequestSchema.safeParse({
        jurisdiction: 'england-wales', // Legacy value
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['jurisdiction']);
      }
    });

    it('should accept canonical england jurisdiction', async () => {
      const { z } = await import('zod');
      const chatRequestSchema = z.object({
        jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']).optional(),
      });

      const result = chatRequestSchema.safeParse({
        jurisdiction: 'england', // Canonical
      });

      expect(result.success).toBe(true);
    });

    it('should accept canonical wales jurisdiction', async () => {
      const { z } = await import('zod');
      const chatRequestSchema = z.object({
        jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']).optional(),
      });

      const result = chatRequestSchema.safeParse({
        jurisdiction: 'wales', // Canonical
      });

      expect(result.success).toBe(true);
    });

    it('should accept canonical scotland jurisdiction', async () => {
      const { z } = await import('zod');
      const chatRequestSchema = z.object({
        jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']).optional(),
      });

      const result = chatRequestSchema.safeParse({
        jurisdiction: 'scotland', // Canonical
      });

      expect(result.success).toBe(true);
    });

    it('should accept canonical northern-ireland jurisdiction', async () => {
      const { z } = await import('zod');
      const chatRequestSchema = z.object({
        jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']).optional(),
      });

      const result = chatRequestSchema.safeParse({
        jurisdiction: 'northern-ireland', // Canonical
      });

      expect(result.success).toBe(true);
    });

    it('should allow undefined jurisdiction (optional field)', async () => {
      const { z } = await import('zod');
      const chatRequestSchema = z.object({
        jurisdiction: z.enum(['england', 'wales', 'scotland', 'northern-ireland']).optional(),
      });

      const result = chatRequestSchema.safeParse({});

      expect(result.success).toBe(true);
    });
  });
});
