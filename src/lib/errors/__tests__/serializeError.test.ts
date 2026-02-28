import { describe, expect, it } from 'vitest';
import { serializeError } from '@/lib/errors/serializeError';

describe('serializeError', () => {
  it('serializes Error instances with name, message, and stack preview', () => {
    const error = new Error('boom');
    error.name = 'BoomError';
    error.stack = [
      'BoomError: boom',
      'line1',
      'line2',
      'line3',
      'line4',
      'line5',
      'line6',
      'line7',
      'line8',
      'line9',
    ].join('\n');

    const serialized = serializeError(error);

    expect(serialized).toEqual({
      name: 'BoomError',
      message: 'boom',
      stackFirstLines: [
        'BoomError: boom',
        'line1',
        'line2',
        'line3',
        'line4',
        'line5',
        'line6',
        'line7',
      ].join('\n'),
    });
  });

  it('serializes non-Error values', () => {
    expect(serializeError('nope')).toEqual({ message: 'nope' });
  });
});
