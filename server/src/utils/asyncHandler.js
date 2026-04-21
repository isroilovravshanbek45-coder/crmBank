/**
 * Async Handler Wrapper
 * Try-catch takrorlanishini oldini oladi
 */

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
