/**
 * @param {HTMLCanvasElement} el
 * @param {CanvasRenderingContext2DSettings} [options]
 * @returns {CanvasRenderingContext2D}
 */
function ctx2d(el, options = {}) {
	const ctx = el.getContext('2d', options);
	if (!ctx) throw new Error('2D context unavailable');
	return ctx;
}

/**
 * Capture a single frame from a video element into a canvas of known size.
 * @param {HTMLVideoElement} videoEl
 * @param {number} w
 * @param {number} h
 */
export function captureFrame(videoEl, w, h) {
	const canvas = document.createElement('canvas');
	canvas.width = w; canvas.height = h;
	const ctx = ctx2d(canvas, { willReadFrequently: true });
	const vidW = videoEl.videoWidth, vidH = videoEl.videoHeight;
	if (!vidW || !vidH) return canvas; // video not loaded, return empty frame
	const scale = Math.min(vidW / w, vidH / h);
	const sx = Math.floor((vidW - w * scale) / 2), sy = Math.floor((vidH - h * scale) / 2);
	const sW = Math.floor(w * scale), sH = Math.floor(h * scale);
	ctx.drawImage(videoEl, sx, sy, sW, sH, 0, 0, w, h);
	return canvas;
}

/**
 * Lightweight pre-processing (scale 2x, grayscale + threshold).
 * @param {HTMLCanvasElement} src
 * @param {{x:number,y:number,w:number,h:number}} r
 */
export function preprocessCrop(src, r) {
	const innerPad = 15; // crop 15px from top/bottom inside the row box
	const sy = r.y + innerPad;
	const sh = Math.max(1, r.h - innerPad * 2);

	const crop = document.createElement('canvas');
	crop.width = r.w; crop.height = sh;
	const cctx = ctx2d(crop, { willReadFrequently: true });
	cctx.drawImage(src, r.x, sy, r.w, sh, 0, 0, r.w, sh);

	const scale = 2;
	const pre = document.createElement('canvas');
	pre.width = r.w * scale; pre.height = sh * scale;
	const pctx = ctx2d(pre, { willReadFrequently: true });
	pctx.imageSmoothingEnabled = false;
	pctx.drawImage(crop, 0, 0, pre.width, pre.height);

	const img = pctx.getImageData(0, 0, pre.width, pre.height);
	const thr = 240; // aggressive threshold
	for (let i = 0; i < img.data.length; i += 4) {
		const r0 = img.data[i] ?? 0, g0 = img.data[i + 1] ?? 0, b0 = img.data[i + 2] ?? 0;
		const y0 = (r0 * 299 + g0 * 587 + b0 * 114) / 1000;
		const v = y0 > thr ? 255 : 0;
		img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
	}
	pctx.putImageData(img, 0, 0);
	return pre;
}

/**
 * Turn a pre-captured canvas into a Blob URL.
 * @param {HTMLCanvasElement} base
 * @returns {Promise<string>}
 */
export function snapshotBlobUrlFromCanvas(base) {
	return new Promise((resolve, reject) => {
		base.toBlob(b => {
			b ? resolve(URL.createObjectURL(b)) : reject(new Error('toBlob failed'));
		}, 'image/png');
	});
}
