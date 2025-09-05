/**
 * Popcount for 32-bit masks
 * @param {number} x
 * @see https://graphics.stanford.edu/~seander/bithacks.html
 */
export function popcount(x) { let c = 0; for (; x; x &= x - 1) c++; return c; }

/**
 * @param {HTMLCanvasElement} el
 * @param {CanvasRenderingContext2DSettings} [options]
 * @returns {CanvasRenderingContext2D}
 */
export function ctx2d(el, options = {}) {
	const ctx = el.getContext('2d', options);
	if (!ctx) throw new Error('2D context unavailable');
	return ctx;
}

export const Config = {
	/**
	 * @param {string} key
	 * @param {string} [def]
	 */
	get: (key, def='') => localStorage.getItem(key) ?? def,
	/**
	 * @param {string} key
	 * @param {string} value
	 */
	set: (key, value) => localStorage.setItem(key, value),
};
