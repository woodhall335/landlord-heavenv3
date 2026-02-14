export type SerializedError = {
  name?: string;
  message: string;
  stackFirstLines?: string;
};

function safeStringifyError(value: unknown): string {
  try {
    return String(value);
  } catch {
    return 'Unserializable error';
  }
}

export function serializeError(error: unknown): SerializedError {
  try {
    if (error instanceof Error) {
      const stackFirstLines = error.stack
        ? error.stack.split('\n').slice(0, 8).join('\n')
        : undefined;
      return {
        name: error.name,
        message: error.message,
        ...(stackFirstLines ? { stackFirstLines } : {}),
      };
    }

    return {
      message: safeStringifyError(error),
    };
  } catch {
    return {
      message: 'Unknown error',
    };
  }
}
