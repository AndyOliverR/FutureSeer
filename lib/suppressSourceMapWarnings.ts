// Suppress source map warnings from node_modules
// These warnings are harmless and come from dependencies like grpc-js, firestore, etc.

if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  const originalError = console.error;

  const suppressedPatterns = [
    /Invalid source map/i,
    /Only conformant source maps can be used/i,
    /sourceMapURL could not be parsed/i,
    /The "payload" argument must be of type object\. Received null/i
  ];

  const shouldSuppress = (message: any): boolean => {
    if (typeof message === 'string') {
      return suppressedPatterns.some(pattern => pattern.test(message));
    }
    if (message instanceof Error) {
      return suppressedPatterns.some(pattern => pattern.test(message.message));
    }
    return false;
  };

  console.warn = (...args: any[]) => {
    if (!shouldSuppress(args[0])) {
      originalWarn.apply(console, args);
    }
  };

  console.error = (...args: any[]) => {
    if (!shouldSuppress(args[0])) {
      originalError.apply(console, args);
    }
  };
}

