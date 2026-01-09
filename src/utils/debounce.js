/**
 * Debounce and throttle utilities
 * Used to prevent excessive API calls and render loops
 */

/**
 * Debounce function - delays execution until after a pause
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds (default 300ms provides good balance for user input)
 * @returns {Function} Debounced function
 */
export function debounce(func, delay = 300) {
  let timeoutId;

  const debounced = function (...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };

  // Add cancel method
  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debounced;
}

/**
 * Throttle function - limits execution to once per time period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 100) {
  let inThrottle;
  let lastResult;

  return function (...args) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }

    return lastResult;
  };
}

/**
 * Create a debounced async function that returns a promise
 * Useful for debouncing API calls
 * @param {Function} func - Async function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced async function
 */
export function debounceAsync(func, delay = 300) {
  let timeoutId;
  let pendingPromise = null;

  return function (...args) {
    clearTimeout(timeoutId);

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            const result = await func.apply(this, args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = null;
          }
        }, delay);
      });
    }

    return pendingPromise;
  };
}
