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

/**
 * @param {number} n
 */
export function toLetter(n) {
	return String.fromCharCode('A'.charCodeAt(0) + n - 1);
}

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
export function rgb2hsv(r, g, b) {
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	const h = (max === min ? 0 : max === r ? (g - b) / (max - min) : max === g ? 2 + (b - r) / (max - min) : 4 + (r - g) / (max - min)) * 60;
	const s = max === 0 ? 0 : (max - min) / max;
	const v = max / 255;
	return [h, s, v];
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
